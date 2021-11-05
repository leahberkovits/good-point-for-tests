import { observable, decorate, action, computed, runInAction, ObservableMap } from 'mobx';
import Consts from '../consts/consts'
import studentsStore from './students_store'
import validate from '../modules/tools/ValidateTool'
import { getT } from "../translation/GPi18n";
import consts from '../consts/consts'

import Auth from '../modules/auth/Auth';

import downloadCsv from '../CSVDownloader/index'
import { getYearOfSelectedMonth } from '../consts/funcs';
const t = getT();

class GoodPointsStore {
    constructor() { // put our total user gp count in a constructore, might solve issue of the count at sent page instead of checking if null at sent_page (which happens in this.countGP() )
        // this.gpCounter = this.countGP();
    }

    gpCounter = null;

    cnt = {};
    classesList = [];

    gpList = null;
    lastCreated = {};
    fetchNoMore = {};

    gpByStudent = {};
    lastGpId = {};
    scrollDownChat = true;
    hasNoMoreChatPoints = {};

    d = new Date();
    selectedMonth = this.d.getMonth() + 1;

    selectedStudent = null;
    studentsListScrollPos = null
    scrollStudentsListQuestionMark = false

    lastMonth = '';
    fetchedMonths = [];

    changePass = false;
    signUp = false;
    showForm2 = false;

    monthToMonthForExcel = [this.d.getMonth(), (this.d.getMonth() + 1) % 12];
    selectedClassesForExcel = [];
    selectedStudentForExcel = {}
    displayExportButton = false;
    errorExportExcel = false;

    linkHash = null;
    gpParentInfo = null;

    chatBackTo = '/send-a-good-point'

    //admin
    adminGPsList = null;
    adminPointsSort = consts.ADMIN_NO_FILTER; //default is by date
    adminPointsSortFetches = [];
    adminLastGPId = 0;
    adminFetchNoMore = false;
    gpIds = [];

    get getGPCounter() {
        (async () => {
            if (this.gpCounter === null) {
                await this.countGP();
            }
        })();
        return this.gpCounter;
    }

    noMore() {
        runInAction(() => { this.fetchMore = false })
    }

    setError(err) {
        runInAction(() => { this.errorExportExcel = err })
    }
    changeMonths(monthsArr) {
        runInAction(() => {
            this.monthToMonthForExcel = monthsArr;
        })
    }

    changePassOpen(changePass) {
        runInAction(() => {
            this.changePass = changePass;
        })
    }
    changeUserAndPass(showForm2) {
        runInAction(() => {
            this.showForm2 = showForm2
        })
    }
    signUpOpen(signUp) {
        runInAction(() => {
            this.signUp = signUp;
        })
    }

    changeExportButtonDisplay(bool) {
        runInAction(() => {
            this.displayExportButton = bool
            !bool && (this.selectedClassesForExcel = [])
        })
    }
    get checkedValues() {
        return this.selectedClassesForExcel;
    }

    student(student) {
        runInAction(() => {
            this.selectedStudent = student;
        })
    }

    set setSelectedMonth(month) {
        runInAction(() => {
            this.selectedMonth = month;
            this.fetchMore = true;
        })
    }

    hasMoreMyActivity() {
        return !this.fetchNoMore[this.selectedMonth];
    }
    leaveSumPage() {
        this.selectedClassesForExcel = [];
        return
    }

    async myActivityGoodPoints(createdFilters, cb, fetchingCurrMonth = false) {
        // 
        let [res, err] = await Auth.superAuthFetch(`/api/GoodPoints/fetchUserGoodPoints?createdRegex=${JSON.stringify(createdFilters)}&lastCreated=${JSON.stringify(this.lastCreated)}`, null, true, true);
        if (err) {
            this.cnt['myActivityGoodPoints'] ? this.cnt['myActivityGoodPoints']++ : this.cnt['myActivityGoodPoints'] = 1;
            if (this.cnt['myActivityGoodPoints'] < 3) {
                setTimeout(() => { this.myActivityGoodPoints(createdFilters, cb, fetchingCurrMonth) }, 1000);
                return;
            }

            const chatError = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            return cb(chatError);
        }
        //if current month is not in fetchedMonths, we must have fetched it now.
        (fetchingCurrMonth) && (() => { setTimeout(() => { this.reloadGpList() }, 1000 * 60 * 60 * 24) })(); //in 24hrs, from current month fetch.
        cb(res.gpList);

    }
    get selectedMonthGoodPoints() { //FILTER MY GOOD POINTS FOR SELECTED MONTH

        //varibals for regex to filter observable good points, the month and the relevent year that the teacher selected
        //used in selected month fetch, and in return filtered good points by selected month

        let selectedMonthDoubleDigit = this.selectedMonth;
        if (selectedMonthDoubleDigit < 10) { selectedMonthDoubleDigit = "0" + JSON.stringify(selectedMonthDoubleDigit) }

        //* fetch default
        if (this.gpList === null) {
            this.fetchDefaultMonths(selectedMonthDoubleDigit);
        }
        //* fetch selected month
        else if (!this.fetchedMonths.includes(this.selectedMonth)) {
            this.fetchSelectedMonth(selectedMonthDoubleDigit);
        }



        //* return good points
        if (typeof this.gpList === "string") {
            return this.gpList
        }
        if (this.gpList !== null && this.gpList[this.selectedMonth]) {
            return this.gpList[this.selectedMonth];
        } return null;
    }

    fetchMorePointsForSelectedMonth() {
        let selectedMonthDoubleDigit = this.selectedMonth;
        if (selectedMonthDoubleDigit < 10) { selectedMonthDoubleDigit = "0" + JSON.stringify(selectedMonthDoubleDigit) }
        this.fetchSelectedMonth(selectedMonthDoubleDigit);
    }

    //* default fetch
    async fetchDefaultMonths(selectedMonthDoubleDigit) {
        let yearOfLastMonth = this.d.getFullYear();
        let currentMonthLimit = `${yearOfLastMonth}-${selectedMonthDoubleDigit}-*`

        let lastMonth = this.selectedMonth - 1;
        if (lastMonth === 0) { lastMonth = 12; yearOfLastMonth-- }
        let lastMonthDoubleDigit = lastMonth;
        if (lastMonthDoubleDigit < 10) { lastMonthDoubleDigit = "0" + JSON.stringify(lastMonthDoubleDigit) }
        let lastMonthLimit = `${yearOfLastMonth}-${lastMonthDoubleDigit}-*`;
        let createdFilters = [lastMonthLimit, currentMonthLimit];

        await this.myActivityGoodPoints(createdFilters, (res) => { // todo shani make sure year is ok here (... for lastMonthLimit)
            if (typeof res !== "string") {
                let currMonthRes = res[this.selectedMonth];
                let lastMonthRes = res[lastMonth];
                runInAction(() => {
                    currMonthRes[currMonthRes.length - 1] && (this.lastCreated[this.selectedMonth] = currMonthRes[currMonthRes.length - 1].gpCreated)
                    lastMonthRes[lastMonthRes.length - 1] && (this.lastCreated[lastMonth] = lastMonthRes[lastMonthRes.length - 1].gpCreated)
                    currMonthRes.length < Consts.GP_LIST_FETCH_LIMIT && (this.fetchNoMore[this.selectedMonth] = true)
                    lastMonthRes.length < Consts.GP_LIST_FETCH_LIMIT && (this.fetchNoMore[lastMonth] = true)
                });
            }
            runInAction(() => {
                this.gpList = res;
                this.fetchedMonths.push(this.selectedMonth, lastMonth)
            });
        }, true);
    }

    //* selected month fetch
    async fetchSelectedMonth(selectedMonthDoubleDigit) {
        let selectedYear = getYearOfSelectedMonth(Number(selectedMonthDoubleDigit) - 1);

        let createdFilter = [selectedYear + "-" + selectedMonthDoubleDigit + "-*"]
        await this.myActivityGoodPoints(createdFilter, (res) => { // changed shani - year of month
            if (typeof res !== "string") {
                let selectedMonthRes = res[this.selectedMonth];
                runInAction(() => {
                    selectedMonthRes.length && (this.lastCreated[this.selectedMonth] = selectedMonthRes[selectedMonthRes.length - 1].gpCreated)
                    this.gpList[this.selectedMonth] = this.gpList[this.selectedMonth] ? [...this.gpList[this.selectedMonth], ...selectedMonthRes] : selectedMonthRes;
                    this.fetchedMonths.push(this.selectedMonth)
                    selectedMonthRes.length < Consts.GP_LIST_FETCH_LIMIT && (this.fetchNoMore[this.selectedMonth] = true)
                });
            } else {
                runInAction(() => {
                    this.gpList = res;
                    this.fetchedMonths.push(this.selectedMonth)
                });
            }
        });
    }

    reloadGpList() {
        let currMonth = this.d.getMonth() + 1;
        let currMonthDoubleDigit = currMonth;
        if (currMonthDoubleDigit > 9) { currMonthDoubleDigit = "0" + JSON.stringify(currMonthDoubleDigit) }

        let year = getYearOfSelectedMonth(currMonth - 1);

        let createdFilter = [year + "-" + currMonthDoubleDigit + "-*"]
        this.myActivityGoodPoints(createdFilter, // todo shani year of month
            (res) => {
                if (res) {
                    runInAction(() => {
                        this.lastCreated[currMonth] = res[currMonth][0].id;
                        this.gpList[currMonth] = res;
                        res[currMonth].length < Consts.GP_LIST_FETCH_LIMIT && (this.fetchNoMore[currMonth] = true)
                    })
                }
            }, true)
    }

    addAGP = (text, cb) => { // POST A NEW GOOD POINT
        return new Promise(async (resolve, reject) => {
            let currStudId = this.selectedStudent.studentId;
            let [res, err] = await Auth.superAuthFetch(`/api/GoodPoints/addAGP`, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                method: "POST",
                body: JSON.stringify({ text: text, studentId: currStudId })
            }, true);
            if (err) {
                // console.log('err: ', err);
                if (err.error && err.error.message === "ER_DATA_TOO_LONG") {
                    reject(t("validation.gp_too_log"));
                    return;
                }
                this.cnt['addAGP'] ? this.cnt['addAGP']++ : this.cnt['addAGP'] = 1;
                if (this.cnt['addAGP'] < 3) {
                    setTimeout(() => { return this.addAGP(text, cb) }, 1000);
                    return;
                }
                const addAGPError = err === "NO_INTERNET" ? t("no_internet_info") : t("validation.internal_error");
                cb(addAGPError) // couldnt make reject() work here bcos of the recursion
                return;
            }

            res = res.gp;
            runInAction(() => {
                this.scrollDownChat = true;
                this.gpCounter = this.getGPCounter + 1;
                res = { ...res, ...this.selectedStudent }; //in addition to res, we need info about the student that the gp belongs to him
                this.gpByStudent[currStudId] ? this.gpByStudent[currStudId].push(res) : (this.gpByStudent[currStudId] = res)
                if (this.gpList !== null) {  //gp list is null when ~not~ going through the home page (gettig to write_a_good_point)
                    typeof this.gpList !== "object" && (this.gpList = {})
                    this.gpList[this.d.getMonth() + 1].unshift(res)
                }
            });
            studentsStore.addAGpToStudent(res);

            resolve(true);
        })
    }

    hasMoreChatPoints() {
        return !this.hasNoMoreChatPoints[this.selectedStudent.studentId]
    }

    async textMessagesByStudent() {
        let currStudId = this.selectedStudent.studentId;
        let [res, err] = await Auth.superAuthFetch(`/api/GoodPoints/goodPointMessagesByStudent?studentId=${JSON.stringify(currStudId)}&lastGpIds=${JSON.stringify(this.lastGpId)}`, null, true);
        if (err) {
            this.cnt['textMessagesByStudent' + currStudId] ? this.cnt['textMessagesByStudent' + currStudId]++ : this.cnt['textMessagesByStudent' + currStudId] = 1;
            if (this.cnt['textMessagesByStudent' + currStudId] < 3) {
                setTimeout(() => { this.textMessagesByStudent() }, 1000);
                return;
            }
            const chatError = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            runInAction(() => {
                this.gpByStudent[currStudId] = chatError
            })
            return;
        }
        res = res.goodPoints;
        runInAction(() => {
            res[res.length - 1] && (this.lastGpId[currStudId] = res[res.length - 1].id)
            this.gpByStudent[currStudId] = this.gpByStudent[currStudId] ? [...res.reverse(), ...this.gpByStudent[currStudId]] : res.reverse()
            res.length < Consts.GP_BY_STUDENT_FETCH_LIMIT && (this.hasNoMoreChatPoints[currStudId] = true)
        })
    }
    get goodPointsByStudent() {
        let currStudId = this.selectedStudent.studentId;
        (async () => {
            if (currStudId && !this.gpByStudent[currStudId]) //already have this student's points //make sure student id is not undefined. it might be undefined when student is chaged to [] (on send a good point page)
                await this.textMessagesByStudent();
        })();
        return this.gpByStudent[currStudId];
    }

    fetchMorePointsForChat = async (ref, prevSH) => {
        let currStudId = JSON.stringify(this.selectedStudent.studentId);
        await this.textMessagesByStudent(true)
        ref.scrollTop = ref.scrollHeight - prevSH; //maybe move from here to comp, but didnt have the right scrollHeight
        return this.gpByStudent[currStudId];
    }

    async countGP() {
        let [res, err] = await Auth.superAuthFetch("/api/GoodPoints/countUserGp", null, true);
        if (err) {
            this.cnt["countGP"] ? this.cnt["countGP"]++ : this.cnt["countGP"] = 1;
            if (this.cnt["countGP"] < 3) {
                setTimeout(() => { this.countGP() }, 1000);
                return;
            }
        }
        else {
            runInAction(() => {
                this.gpCounter = res.gpUserCount;
            });
        }
    }


    setStudentsListScrollPos = (scrollTop) => {
        this.studentsListScrollPos = scrollTop
    }

    changeSelectedStudentForExcel(student) {
        runInAction(() => {
            this.selectedStudentForExcel = student;
        })
    }

    async objGenerateForExportCSV(mail) {

        let months = this.monthToMonthForExcel.map(monthNum => monthNum + 1)

        let url = { months: months, mail: mail }

        if (Array.isArray(this.selectedClassesForExcel) && this.selectedClassesForExcel.length) {
            // if user selected classes for excel
            url.classesId = this.selectedClassesForExcel.map(i => i)
        }
        else if (typeof this.selectedStudentForExcel === "object" && Object.entries(this.selectedStudentForExcel).length) {
            // if user selected a student for excel
            url.studentId = this.selectedStudentForExcel.studentId;
        } else {

            return false;
        }
        return url;
    }

    async exportCSV(mail) {
        this.objGenerateForExportCSV(mail).then(async (obj, error) => {
            if (!obj) return;
            let [res, err] = await Auth.superAuthFetch("/api/GoodPoints/exportExcelFile", {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                method: "POST",
                body: JSON.stringify(obj)
            });

            // 
            if (err) {
                this.cnt["exportCSV"] ? this.cnt["exportCSV"]++ : this.cnt["exportCSV"] = 1;
                if (this.cnt["exportCSV"] < 3) {
                    setTimeout(() => { this.exportCSV(mail) }, 1000);
                    return;
                }

                runInAction(() => { this.errorExportExcel = (err.error && typeof err.error.message === "string" && err.error.message === "EMAIL_ERROR") ? t("validation.wrong_mail2") : t("validation.mail_try_again") })
            }
            if (res) {
                downloadCsv(res.success.datas, res.success.columns, `${t("sum_file_name")}.csv`); //res from this is the information sent to it
                this.errorExportExcel = false;
                this.displayExportButton = false;
                this.selectedClassesForExcel = [];
                if (this.cnt["exportCSV"] === 3) {
                    this.cnt["exportCSV"] = 0;
                }
            }
            this.changeExportButtonDisplay(false);
            if (this.cnt["exportCSV"] === 3) {
                this.cnt["exportCSV"] = 0;
            }
            return;
        }); //end then
    }

    handleClassesForExcelCheck(e, cId) { // i is an array -for supporting full grade mark
        //set array observable for radio buttonsin classes sum
        let checkedValues;
        if (Array.isArray(cId)) { // pressed a grade
            // if one of the ids in "cId" is selected --> select all
            let selectAll = true; //gonna deselectAll ONLY when ALL are selected
            let allAreSelected = true;
            checkedValues = Array.from(this.selectedClassesForExcel);
            // if (!checkedValues || !checkedValues.length) selectAll = true; //if ALL CLASES (in all grades) are deselected
            // else
            if (checkedValues && checkedValues.length) {
                for (let cIdToSelect1 in cId) {
                    if (!this.selectedClassesForExcel.includes(cId[cIdToSelect1])) {
                        allAreSelected = false;
                        break;
                    }
                }
                if (allAreSelected) selectAll = false
            }

            // if need to mark all -- go over this.selectedClassesForExcel and if selectedCId is in cId (cId.includes(this....)) -- 
            for (let cIdToSelect2 in cId) {
                if (selectAll && !this.selectedClassesForExcel.includes(cId[cIdToSelect2])) { //select all in grade
                    checkedValues.push(cId[cIdToSelect2])
                }
                else if (!selectAll) {
                    checkedValues = checkedValues.filter(checkedVal => checkedVal != cId[cIdToSelect2]) //deselect all in grade
                }
            }
        }
        else {
            checkedValues = this.selectedClassesForExcel.includes(cId) //adds the class index to the array and removes the class index if it is already there 
                ? this.selectedClassesForExcel.filter(v => v !== cId)
                : [...this.selectedClassesForExcel, cId];
        }
        runInAction(() => {
            this.selectedClassesForExcel = checkedValues;
            this.errorExportExcel = '';
            this.displayExportButton = this.selectedClassesForExcel.length > 0
        });
    }

    get goodpointForSmsPage() {
        let url = window.location.href.split("/");
        let linkHash = url[url.length - 1]
        if (!linkHash) return [];
        if (!this.isValidLink(linkHash)) return []; //not valid link, not even fetching.
        if (this.linkHash === null) {
            runInAction(() => { this.linkHash = linkHash; });
            const goodpointForSmsPageFetch = async () => {
                let [res, err] = await Auth.superAuthFetch(`/api/GoodPoints/parentsLandingPageInfo?hashLink=${this.linkHash}`, null, true);
                if (err) {
                    this.cnt["goodpointForSmsPage"] ? this.cnt["goodpointForSmsPage"]++ : this.cnt["goodpointForSmsPage"] = 1;
                    if (this.cnt["goodpointForSmsPage"] < 3) {
                        setTimeout(() => { goodpointForSmsPageFetch() }, 1000);
                        return;
                    }
                    return;
                }
                runInAction(() => { this.gpParentInfo = res.gp });
            }; goodpointForSmsPageFetch(); //inner function - (()=>{})(); but not annonymous
        }
        if (this.gpParentInfo !== null) {
            return this.gpParentInfo;
        }
    }
    isValidLink(rnd) {
        let linkRegex = /^[0-9a-zA-Z]+$/;
        if (rnd.match(linkRegex) && rnd.length === 5) return true;
        return false;
    }


    async adminGPsFetch() {
        let [res, err] = await Auth.superAuthFetch(`/api/GoodPoints/adminGPsFetch?gpIds=${JSON.stringify(this.gpIds)}&order=DATE`, null, true, true);
        if (err) {
            this.cnt["adminGPsFetch"] ? this.cnt["adminGPsFetch"]++ : this.cnt["adminGPsFetch"] = 1;
            if (this.cnt["adminGPsFetch"] < 3) {
                setTimeout(() => { this.adminGPsFetch() }, 1000);
                return;
            }

            const error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            runInAction(() => {
                this.adminGPsList = error;
            })
            return;
        }
        runInAction(() => {
            this.adminGPsList = res.adminGPs;
            this.adminFetchNoMore = res.adminGPs.length < consts.ADMIN_POINTS_FETCH_LIMIT;
            this.gpIds.push(...res.adminGPs.map(gp => gp.id));
        })
    }

    adminFetchMoreGPs = async (pointsSort) => { // arrow function cause might be called on a scroll event (as a handle scroll function)
        console.log('adminFetchMoreGPs: ');
        let order;
        switch (pointsSort) {
            case consts.ADMIN_POINTS_CLASSES_SORT:
                order = 'GRADE';
                break;
            case consts.ADMIN_POINTS_TEACHERS_SORT:
                order = "TEACHER"
                break;
            case consts.ADMIN_POINTS_DATE_SORT:
                order = "DATE";
                break;
            default:
                order = "DATE"
        }
        let [res, err] = await Auth.superAuthFetch(`/api/GoodPoints/adminGPsFetch?gpIds=${JSON.stringify(this.gpIds)}&order=${order}`, null, true, true);
        if (err) {
            this.cnt["adminFetchMoreGPs"] ? this.cnt["adminFetchMoreGPs"]++ : this.cnt["adminFetchMoreGPs"] = 1;
            if (this.cnt["adminFetchMoreGPs"] < 3) {
                setTimeout(() => { this.adminFetchMoreGPs() }, 1000);
                return;
            }
        }
        runInAction(() => {
            Array.isArray(this.adminGPsList) && this.adminGPsList.push(...res.adminGPs);
            this.adminFetchNoMore = res.adminGPs.length < consts.ADMIN_POINTS_FETCH_LIMIT;
            this.gpIds.push(...res.adminGPs.map(gp => gp.id));
        })
        this.cnt["adminFetchMoreGPs"] = 0;
    }

    get adminGPs() {
        (async () => {
            if (this.adminGPsList === null)
                await this.adminGPsFetch();
        })();

        let adminGPsList = this.adminGPsList;

        if (!adminGPsList || adminGPsList === null) return null;

        if (Array.isArray(adminGPsList)) {
            if (this.adminPointsSort === consts.ADMIN_POINTS_CLASSES_SORT)
                adminGPsList = adminGPsList.sort((gpA, gpB) => (gpA.Student.Class.grade == gpB.Student.Class.grade) ? ((gpA.Student.Class.classIndex < gpB.Student.Class.classIndex) ? -1 : (gpA.Student.Class.classIndex > gpB.Student.Class.classIndex) ? 1 : 0) : (gpA.Student.Class.grade < gpB.Student.Class.grade) ? -1 : 1)
            else if (this.adminPointsSort === consts.ADMIN_POINTS_TEACHERS_SORT) {
                adminGPsList = adminGPsList.sort((gpA, gpB) => (gpA.Teacher.firstName === gpB.Teacher.firstName) ? ((gpA.Teacher.lastName < gpB.Teacher.lastName) ? -1 : (gpA.Teacher.lastName > gpB.Teacher.lastName) ? 1 : 0) : (gpA.Teacher.firstName < gpB.Teacher.firstName) ? -1 : 1)
            }
            else {
                //sort by newer to oldest - default
                adminGPsList = adminGPsList.sort((gpA, gpB) => ((new Date(gpA.created) > new Date(gpB.created)) ? -1 : (new Date(gpA.created) < new Date(gpB.created)) ? 1 : 0));
            }
        }

        return adminGPsList;
    }

    get adminHasMorePoints() {
        return !this.adminFetchNoMore;
    }

    setSortAdminGPs(sort) {
        (async () => {
            if (!this.adminPointsSortFetches.includes(sort)) await this.adminFetchMoreGPs(sort);
            this.adminPointsSortFetches.push(sort);
        })();
        runInAction(() => {
            this.adminPointsSort = sort;
        })
    }


    async adminResetSchoolGPs(cb) { // cb must be called and be passed a :string
        let [res, err] = await Auth.superAuthFetch('/api/GoodPoints/adminResetCurrSchoolGPs', null, true)
        if (res) {
            cb(t("alerts.succed_reset_gp"))
            runInAction(() => {
                this.adminGPsList = []
            })
        }
        else cb(t("try_again_later"))
    }



} // end of class 



decorate(GoodPointsStore, {

    changePassOpen: action,
    changePass: observable,

    signUpOpen: action,
    signUp: observable,

    changeUserAndPass: action,
    showForm2: observable,

    error: observable,
    selectedMonth: observable,
    gpList: observable,
    selectedMonthGoodPoints: computed,
    fetchMore: observable,

    selectedStudent: observable,
    student: action,
    setStudentsListScrollPos: action,
    studentsListScrollPos: observable,

    gpByStudent: observable,
    goodPointsByStudent: computed,

    countGP: observable,
    gpCounter: observable,
    getGPCounter: computed,
    addAGP: observable,

    checkedValues: computed,
    selectedClassesForExcel: observable,
    displayExportButton: observable,
    handleClassesForExcelCheck: action,
    errorExportExcel: observable,

    goodpointForSmsPage: computed,
    linkHash: observable,
    gpParentInfo: observable,

    adminGPs: computed,
    adminGPsList: observable,

    adminPointsSort: observable,
    setSortAdminGPs: action,

    adminHasMorePoints: computed,
    adminFetchNoMore: observable,


});

let gpstore = new GoodPointsStore;//window.gpstore =
export default gpstore;

