import { observable, decorate, action, computed, runInAction } from 'mobx';
import { toJS } from 'mobx';
import { getLanguage, getT } from "../translation/GPi18n";

import ClassesUtils from '../components/ClassesUtils'
import Auth from '../modules/auth/Auth';
import SortOptions from '../consts/SortStudentsOptions'
import consts, { ENG_TO_HEB_STUDENTS_EXCEL_HEADERS, ENG_TO_HEB_CLASSES_EXCEL_HEADERS, STUDENTS_EXCEL_HEADERS_TRANSLATE } from '../consts/consts';

const t = getT();

class StudentsStore {

    cnt = {};
    studentsList = null;
    fetchedSIds = []

    fetchSNamesTO = null;
    currentlyFetching = false;

    fetchMoreByFilter = {}
    firstFetches = {} // { 0: ["d", "c"], "א1": [] } 

    gradeSelected = consts.NO_CLASS_FILTER;
    indexSelected = consts.NO_CLASS_FILTER;
    studentsFilter = consts.NO_STUDENTS_FILTER;

    error = null;
    sort = SortOptions.GP_SUM_SORT;

    classesList = null;

    hebGrades = null;

    //admin
    adminStudentsList = null;
    adminShowAllStudents = consts.ADMIN_STUDENTS_ALL;
    adminCurrentlyFetchingStudents = false;
    adminCurrentlyFetchingClasses = false;
    fetchedFloatingStudents = false;

    selectedAdminStudents = []

    adminFetchMoreStudentsByFilter = {}

    adminStudentsGradeFilter = consts.ADMIN_NO_FILTER;
    adminStudentsClassIndexFilter = consts.ADMIN_NO_FILTER;
    adminStudentsNameFilter = consts.ADMIN_NO_FILTER;

    teachersList = null;
    studentChangesList = {};
    studentsToDeleteList = [];


    classesChangesList = {};
    adminClassesList = null;
    classesToDeleteList = [];

    postClassesSuccess = null;
    postStudentsSuccess = null;
    teachersList = null;

    adminClassesGradeFilter = consts.ADMIN_NO_FILTER;
    adminClassesClassIndexFilter = consts.ADMIN_NO_FILTER;
    adminClassesNameFilter = consts.ADMIN_NO_FILTER;

    adminFetchedSIds = [];
    adminFetchedCIds = [];

    adminFetchSNamesTO = null;
    adminFetchedSRegexes = [];
    adminFetchedSGrades = [];
    adminFetchedSClassIndexes = [];

    adminFetchMoreClassesByFilter = {}; // for the infinite scroll, to know whether filters need fetching or not. this object is big. will have the grade filters and inside, the classIndex, and inside the name filter

    adminFetchedCRegexes = [];
    adminFetchedCGrades = [];
    adminFetchedCClassIndexes = [];

    adminStudentsTableShowFilters = false;

    adminFloatingList = [];
    adminFloatingIDs = [];
    adminCurrentlyFetchingFloating = false;
    adminHasNoMoreFloatingToFetch = { search: {}, no_filter: false };
    adminFetchedFloatRegexes = []


    /**
     * @param {string} grade i think
    */
    set grade(grade) {
        if (grade !== consts.NO_CLASS_FILTER) grade = ClassesUtils.convertToEnglishGrades(grade);
        this.gradeSelected = grade;
    }
    /**
     * @param {number} index i think
    */
    set index(index) {
        this.indexSelected = index;
    }

    get getHebrewGrades() {
        const lang = getLanguage();
        if (this.hebGrades === null || this.lang !== lang) {
            this.lang = lang;
            (async () => {
                let hgs = await ClassesUtils.getHebrewGrades();
                hgs.sort()
                runInAction(() => {
                    this.hebGrades = hgs;
                })
            })();
        }
        if (this.hebGrades !== null) return this.hebGrades;
        return []
    }


    async fetchStudents(cb = false) { //cb is only for addAGPToStudent
        if (this.currentlyFetching) return;
        this.currentlyFetching = true

        let url = `/api/Students/studentsFetch?name=${this.studentsFilter !== consts.NO_STUDENTS_FILTER ? this.studentsFilter : JSON.stringify(null)}&clas=${this.gradeSelected !== consts.NO_CLASS_FILTER && this.indexSelected !== consts.NO_CLASS_FILTER ? JSON.stringify(this.gradeSelected + this.indexSelected) : JSON.stringify(null)}&fetchedSIds=${this.fetchedSIds ? JSON.stringify(this.fetchedSIds) : []}`;
        let [res, err] = await Auth.superAuthFetch(url, null, true, true);
        if (err) {
            this.cnt["fetchStudents"] ? this.cnt["fetchStudents"]++ : this.cnt["fetchStudents"] = 1;
            if (this.cnt["fetchStudents"] < 3) {
                setTimeout(() => { this.fetchStudents(cb) }, 1000);
                return;
            }
            const error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            runInAction(() => {
                this.studentsList = error;
            })
            this.cnt["fetchStudents"] = 0;
            this.currentlyFetching = false
            return false;
        }
        //success
        const idsArr = res.moreStudentsByFilters.map(s => s.id).filter(id => id);
        const pos = this.gradeSelected == consts.NO_CLASS_FILTER || this.indexSelected == consts.NO_CLASS_FILTER ? consts.NO_CLASS_FILTER : this.gradeSelected + this.indexSelected;
        runInAction(() => {
            res.moreStudentsByFilters && res.moreStudentsByFilters.length ? //update students list
                (this.studentsList && Array.isArray(this.studentsList) ? this.studentsList.push(...res.moreStudentsByFilters) : this.studentsList = res.moreStudentsByFilters)
                : (!this.studentsList || this.studentsList === null) && (this.studentsList = [])
            this.fetchedSIds.push(...idsArr) //fetched ids
            if (!this.fetchMoreByFilter[pos])
                this.fetchMoreByFilter[pos] = {}
            this.fetchMoreByFilter[pos][this.studentsFilter] = res.moreStudentsByFilters && res.moreStudentsByFilters.length === consts.STUDENTS_LIST_FETCH_LIMIT
            Array.isArray(this.firstFetches[pos]) && this.firstFetches[pos].every(n => n != this.studentsFilter) ? this.firstFetches[pos].push(this.studentsFilter)
                : this.firstFetches[pos] = [this.studentsFilter]
        });
        this.currentlyFetching = false; //put it here for studentsSum and searchStudents loading msg (if we move this line to after runInAction- it'll be after the filteredStudents was called and too late to change anything)
        this.cnt["fetchStudents"] = 0;
        if (cb && typeof cb === "function") cb(this.studentsList)
        return true;
    }


    get hasStudentsToStartWith() {
        const pos = (this.gradeSelected == consts.NO_CLASS_FILTER || this.indexSelected == consts.NO_CLASS_FILTER) ? consts.NO_CLASS_FILTER : (typeof this.gradeSelected === "string" ? (typeof this.indexSelected === "string" ? this.gradeSelected + this.indexSelected : this.gradeSelected + JSON.stringify(this.indexSelected)) : (typeof this.indexSelected === "string" ? JSON.stringify(this.gradeSelected) + this.indexSelected : JSON.stringify(this.gradeSelected) + JSON.stringify(this.indexSelected)))
        for (let fetchedC in this.firstFetches) {
            if (fetchedC == pos) {
                for (let fetchedN in this.firstFetches[fetchedC]) {
                    if (this.firstFetches[fetchedC][fetchedN] == this.studentsFilter) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    get hasMoreStudents() {
        const pos = (this.gradeSelected == consts.NO_CLASS_FILTER || this.indexSelected == consts.NO_CLASS_FILTER) ? consts.NO_CLASS_FILTER : (typeof this.gradeSelected === "string" ? (typeof this.indexSelected === "string" ? this.gradeSelected + this.indexSelected : this.gradeSelected + JSON.stringify(this.indexSelected)) : (typeof this.indexSelected === "string" ? JSON.stringify(this.gradeSelected) + this.indexSelected : JSON.stringify(this.gradeSelected) + JSON.stringify(this.indexSelected)))
        //return false if we got all info in this.fetchMoreByFilter[NO_CLASS_FILTER][NO_STUDENTS_FILTER] --> if got ALL students there --> will have all students everywhere
        // if (!(this.fetchMoreByFilter[consts.NO_CLASS_FILTER] && this.fetchMoreByFilter[consts.NO_CLASS_FILTER][consts.NO_STUDENTS_FILTER])) return false; //fetched all
        if (!this.fetchMoreByFilter[pos]) return false
        let more = this.fetchMoreByFilter[pos][this.studentsFilter] === true
        return more;
    }


    async handleSendAGPStudentsScroll() { //got to bottom, need to fetch more students
        const fetchMore = this.hasMoreStudents
        if (/* !this.currentlyFetching &&  */fetchMore) {
            this.fetchStudents();
        }
        if (fetchMore) return true;
        return false
    }

    updateStudentsAfterGPSend(studentsList, newStudentObj) {
        let students = studentsList;
        students = students.map(stud => {
            let newStudent = { ...stud };
            if (stud.id === newStudentObj.studentId) {
                newStudent.gpCount++;
            }
            return newStudent
        })
        runInAction(() => { this.studentsList = students })
    }
    updateClassesAfterGPSend(classesList, newStudentObj) {
        let classes = classesList;
        classes = classes.map(cls => {
            let newClass = { ...cls };
            if (newStudentObj.grade == cls.grade && newStudentObj.classIndex == cls.classIndex) {
                newClass.gpSum = !newClass.gpSum ? 1 : cls.gpSum + 1;
            }
            return newClass
        })
        runInAction(() => { this.classesList = classes })
    }

    async addAGpToStudent(newStudentObj) { // i wish i could record an exlanation- BUT for now ill just explain:
        // sending a new point requires changes for the studentsList (.gpCount) and for classesList (gpSum--class gps sum). the problem is that we won't neccesarily have the studentsList OR the classesList. so we need to fetch. we can't make it computed cos we want it to be called only on once and not every time classesList/studentsList changes so i added an option of a cb in each of the fetching functions we call here (<) and they call the functions that really do the inc of gp- when we got the lists 
        if (this.studentsList === null) {
            return; //why do we need to fetch if no list ??? on fetch, we should get the right data .... ?
            this.fetchStudents(studentsList => { this.updateStudentsAfterGPSend(studentsList, newStudentObj) });
        }
        else this.updateStudentsAfterGPSend(this.studentsList, newStudentObj)
        if (this.classesList === null) {
            return; //why do we need to fetch if no list ??? on fetch, we should get the right data .... ?
            this.fetchClassesList(classesList => { this.updateClassesAfterGPSend(classesList, newStudentObj) });
        }
        else this.updateClassesAfterGPSend(this.classesList, newStudentObj)
    }

    setStudentsFilter(f) {
        runInAction(() => {
            this.studentsFilter = f
        })
    }

    get filteredStudents() {
        (async () => {
            if (this.studentsList === null && typeof this.studentsList !== "string") { this.fetchStudents(); return null; }
        })();
        // if (this.currentlyFetching) return null; //loading msg

        let filteredStudents;
        filteredStudents = this.studentsList;
        if (filteredStudents === null || typeof filteredStudents === "string") return filteredStudents;

        // if user is typing in search bar
        if (this.studentsFilter) {
            clearTimeout(this.fetchSNamesTO);
            let regexFilter = new RegExp("^" + this.studentsFilter, "i");
            filteredStudents = filteredStudents.filter(student => regexFilter.test(student.firstName) || regexFilter.test(student.lastName) || regexFilter.test(student.firstName + " " + student.lastName));

            this.fetchSNamesTO = setTimeout(async () => {
                if (/* !this.currentlyFetching && */ this.hasStudentsToStartWith) {
                    this.fetchStudents();
                }
            }, 400);

            //the timeout and the clear timeout is so we don't fetch for every letter that the user write- but rather once he stops a little
        }

        // if class dropdown was clicked
        if (this.gradeSelected !== consts.NO_CLASS_FILTER && this.indexSelected !== consts.NO_CLASS_FILTER) {
            filteredStudents = filteredStudents.filter((student) => (student.Class.grade == this.gradeSelected) && (student.Class.classIndex == this.indexSelected));
            if (/* !this.currentlyFetching &&  */this.hasStudentsToStartWith) {
                this.fetchStudents();
            }
        }
        return filteredStudents; //gets sorted later by gpCount, then student name(in print_students.js)
    }

    async fetchMoreStudentsForSumOnScroll() {
        const fetchMore = this.hasMoreStudents
        if (/* !this.currentlyFetching && */ fetchMore)
            this.fetchStudents();
    }

    async fetchClassesList(cb = false) {
        let [res, err] = await Auth.superAuthFetch("api/Students/countClassGp", null, true, true)
        if (err) {
            this.cnt["addClassSumToClassData"] ? this.cnt["addClassSumToClassData"]++ : this.cnt["addClassSumToClassData"] = 1;
            if (this.cnt["addClassSumToClassData"] < 3) {
                setTimeout(() => { this.fetchClassesList(cb) }, 1000);
                return;
            }
            const classesError = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            runInAction(() => {
                this.classesList = classesError;
            })
        } else {
            runInAction(() => {
                this.classesList = res.gpSum;
            })
            if (cb && typeof cb === "function") cb(res.gpSum)
        }
    }

    get classes() { //only place this is called is on classes sum
        (async () => {
            if (this.classesList === null) {
                await this.fetchClassesList()
            }
        })();
        return this.classesList
    }


    async adminFetchStudents(fromRecursion = false) {
        if (this.adminCurrentlyFetchingStudents) return;
        this.adminCurrentlyFetchingStudents = true
        let url = `/api/Students/adminStudentsFetch?onlyFloating=${JSON.stringify(false)}&name=${this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER ? this.adminStudentsNameFilter : JSON.stringify(null)}&grade=${JSON.stringify(this.adminStudentsGradeFilter)}&cIndex=${typeof this.adminStudentsClassIndexFilter === "string" ? this.adminStudentsClassIndexFilter : JSON.stringify(this.adminStudentsClassIndexFilter)}&fetchedSIds=${JSON.stringify(this.adminFetchedSIds)}`; //(&grade &cIndex)-as long as consts.NO_ADMIN_FILTER is null -- otherwise need to do like in ?name=
        let [res, err] = await Auth.superAuthFetch(url, null, true, true);
        if (err && !fromRecursion) {
            this.cnt["adminFetchStudents"] ? this.cnt["adminFetchStudents"]++ : this.cnt["adminFetchStudents"] = 1;
            if (this.cnt["adminFetchStudents"] < 3) {
                setTimeout(() => { this.adminFetchStudents() }, 1000);
                return;
            }
            const error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            this.adminCurrentlyFetchingStudents = false;
            runInAction(() => {
                this.adminStudentsList = error;
            })
            this.cnt["adminFetchStudents"] = 0;
            return false;
        }
        if (!fromRecursion) {
            runInAction(() => {
                this.adminStudentsList = Array.isArray(this.adminStudentsList) && this.adminStudentsList.length ? [...this.adminStudentsList, ...res.adminStudentsList] : res.adminStudentsList;
                this.adminFetchedSIds.push(...res.adminStudentsList.map(s => s.id)) //fetched ids
                if (!this.adminFetchMoreStudentsByFilter[this.adminStudentsGradeFilter])
                    this.adminFetchMoreStudentsByFilter[this.adminStudentsGradeFilter] = {}
                if (!this.adminFetchMoreStudentsByFilter[this.adminStudentsGradeFilter][this.adminStudentsClassIndexFilter])
                    this.adminFetchMoreStudentsByFilter[this.adminStudentsGradeFilter][this.adminStudentsClassIndexFilter] = {}
                this.adminFetchMoreStudentsByFilter[this.adminStudentsGradeFilter][this.adminStudentsClassIndexFilter][this.adminStudentsNameFilter] = res.adminStudentsList && res.adminStudentsList.length === consts.ADMIN_STUDENTS_FETCH_LIMIT;
            });
            this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER && this.adminFetchedSRegexes.every(f => f != this.adminStudentsNameFilter) && this.adminFetchedSRegexes.push(this.adminStudentsNameFilter) //fetched regex names searches
            this.adminStudentsGradeFilter !== consts.ADMIN_NO_FILTER && this.adminFetchedSGrades.every(f => f != this.adminStudentsGradeFilter) && this.adminFetchedSGrades.push(this.adminStudentsGradeFilter) //fetched grades searches
            this.adminStudentsClassIndexFilter !== consts.ADMIN_NO_FILTER && this.adminFetchedSClassIndexes.every(f => f != this.adminStudentsClassIndexFilter) && this.adminFetchedSClassIndexes.push(this.adminStudentsClassIndexFilter) //fetched grades searches

            Array.isArray(consts.originalAdminStudentsList) && consts.originalAdminStudentsList.push(...res.adminStudentsList)
            this.cnt["adminFetchStudents"] = 0;
        }

        this.adminCurrentlyFetchingStudents = false;
        return true;
    }

    adminFetchMoreStudentsOnSCroll() {
        if (this.adminShowAllStudents === consts.ADMIN_STUDENTS_FLOATING && !this.adminCurrentlyFetchingFloating) {
            this.adminFetchMoreFloating();
            return;
        }
        if (!this.adminCurrentlyFetchingStudents && this.adminHasMoreStudentsToFetch) this.adminFetchStudents();
    }
    get adminHasMoreStudentsToFetch() {
        if (this.adminShowAllStudents === consts.ADMIN_STUDENTS_FLOATING) { return true; }
        //need to return false if we got all info in this.fetchMoreByFilter[NO_CLASS_FILTER][NO_STUDENTS_FILTER] --> if got ALL students there --> will have all students everywhere
        //need to check in EVERY scope whether the cosnts.no_admin_filter is false - and then return false  
        if (this.adminFetchMoreStudentsByFilter[consts.ADMIN_NO_FILTER][consts.ADMIN_NO_FILTER][consts.ADMIN_NO_FILTER] === false)
            return false

        // if (Object.keys(this.adminFetchMoreStudentsByFilter).every(g => g != this.adminStudentsGradeFilter)) return true
        // ^ this is for on scroll - whether has more to fetch based on the current filter. in that case, adminFetchMoreStudentsByFilter[this.adminStudentsGradeFilter][this.adminStudentsClassIndexFilter][this.studentsFilter] shouldn definitly have info already 
        return this.adminFetchMoreStudentsByFilter[this.adminStudentsGradeFilter][this.adminStudentsClassIndexFilter][this.adminStudentsNameFilter]
    }

    get getAdminStudentsList() {
        if (this.adminShowAllStudents === consts.ADMIN_STUDENTS_FLOATING) {
            if (this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER) {
                clearTimeout(this.adminFetchSNamesTO);
                this.adminFetchSNamesTO = setTimeout(() => {
                    if (!this.adminCurrentlyFetchingFloating && !this.adminFetchedFloatRegexes.includes(this.adminStudentsNameFilter)) {
                        this.adminFetchMoreFloating();
                    }
                }, 400);
                let regexFilter = new RegExp("^" + this.adminStudentsNameFilter, "i");

                return this.adminFloatingList.filter(student => regexFilter.test(student.firstName) || regexFilter.test(student.lastName) || regexFilter.test(student.firstName + " " + student.lastName));
                //the timeout and the clear timeout is so we don't fetch for every letter that the user write- but rather once he stops a little
            }
            else {
                this.adminFetchMoreFloating();
                return this.adminFloatingList;
            }
        }


        (async () => {
            if (this.adminStudentsList === null && typeof this.adminStudentsList !== "string") {
                await this.adminFetchStudents();
                Array.isArray(this.adminStudentsList) &&
                    (consts.originalAdminStudentsList = Array.from(toJS(this.adminStudentsList)))
            }
        })();

        if (!this.adminStudentsList || this.adminStudentsList == null) return null;
        if (typeof this.adminStudentsList === "string") return this.adminStudentsList
        if (!Array.isArray(this.adminStudentsList)) { return t("try_again_later") }
        let filteredAdminStudents = this.adminStudentsList.filter((v, i) => this.adminStudentsList.indexOf(v) === i)

        if (typeof filteredAdminStudents === "string") return filteredAdminStudents

        if (this.adminStudentsGradeFilter !== consts.ADMIN_NO_FILTER) {
            filteredAdminStudents = filteredAdminStudents.filter(s => s.Class && this.adminStudentsGradeFilter == s.Class.grade)
            if (!this.adminCurrentlyFetchingStudents && !this.adminFetchedSGrades.includes(this.adminStudentsGradeFilter)) {
                this.adminFetchStudents();
            }
        }
        if (this.adminStudentsClassIndexFilter !== consts.ADMIN_NO_FILTER) {
            filteredAdminStudents = filteredAdminStudents.filter(s => s.Class && s.Class.classIndex == this.adminStudentsClassIndexFilter)
            if (!this.adminCurrentlyFetchingStudents && !this.adminFetchedSClassIndexes.includes(this.adminStudentsClassIndexFilter)) {
                this.adminFetchStudents();
            }
        }
        if (this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER) {
            clearTimeout(this.adminFetchSNamesTO);
            let regexFilter = new RegExp("^" + this.adminStudentsNameFilter, "i");
            filteredAdminStudents = filteredAdminStudents.filter(student => regexFilter.test(student.firstName) || regexFilter.test(student.lastName) || regexFilter.test(student.firstName + " " + student.lastName));
            this.adminFetchSNamesTO = setTimeout(() => {
                if (!this.adminCurrentlyFetchingStudents && !this.adminFetchedSRegexes.includes(this.adminStudentsNameFilter)) {
                    this.adminFetchStudents();
                }
            }, 400);
            //the timeout and the clear timeout is so we don't fetch for every letter that the user write- but rather once he stops a little
        }

        /* // maybe later
        else if (this.adminShowAllStudents === consts.ADMIN_STUDENTS_WITH_CLASSES) {
            filteredAdminStudents = filteredAdminStudents.filter(s => s.classId !== null)
        }
        // else all studnets. 
        */
        return filteredAdminStudents.sort((s1, s2) => {
            if (s1.firstName < s2.firstName) return -1;
            if (s1.firstName > s2.firstName) return 1;
            if (s1.lastName < s2.lastName) return -1;
            if (s1.lastName > s2.lastName) return 1;
            return 0;
        });
    }

    async adminFetchFloating(fromRecursion = false) {
        if (this.adminCurrentlyFetchingFloating) return;
        this.adminCurrentlyFetchingFloating = true
        let url = `/api/Students/adminStudentsFetch?onlyFloating=${JSON.stringify(true)}&name=${this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER ? this.adminStudentsNameFilter : JSON.stringify(null)}&grade=null&cIndex=null&fetchedSIds=${JSON.stringify(this.adminFloatingIDs)}`; //(&grade &cIndex)-as long as consts.NO_ADMIN_FILTER is null -- otherwise need to do like in ?name=
        let [res, err] = await Auth.superAuthFetch(url, null, true, true);
        console.log("fetching floating");
        if (err && !fromRecursion) {
            this.cnt["adminFetchFloating"] ? this.cnt["adminFetchFloating"]++ : this.cnt["adminFetchFloating"] = 1;
            if (this.cnt["adminFetchFloating"] < 3) {
                setTimeout(() => { this.adminFetchFloating() }, 1000);
                return;
            }
            const error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            this.adminCurrentlyFetchingFloating = false;
            runInAction(() => {
                this.adminStudentsList = error;
            })
            this.cnt["adminFetchFloating"] = 0;
            return false;
        }
        if (!fromRecursion) {
            runInAction(() => {
                if (Array.isArray(res.adminStudentsList)) {
                    this.adminFloatingList = Array.isArray(this.adminFloatingList) && this.adminFloatingList.length ? [...this.adminFloatingList, ...res.adminStudentsList] : res.adminStudentsList;
                    this.adminFloatingIDs.push(...res.adminStudentsList.map(s => s.id)) //fetched ids}
                }
            });
            this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER && this.adminFetchedFloatRegexes.every(f => f != this.adminStudentsNameFilter) && this.adminFetchedFloatRegexes.push(this.adminStudentsNameFilter) //fetched regex names searches
            if (res.adminStudentsList && res.adminStudentsList.length && res.adminStudentsList.length < consts.ADMIN_FLOATING_STUDENTS_FETCH_LIMIT) {
                if (this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER) {
                    this.adminHasNoMoreFloatingToFetch["search"][this.adminStudentsNameFilter] = true;
                }
                else this.adminHasNoMoreFloatingToFetch["no_filter"] = true;
            }
            Array.isArray(consts.originalAdminStudentsList) && consts.originalAdminStudentsList.push(...res.adminStudentsList)
            this.cnt["adminFetchFloating"] = 0;
        }

        this.adminCurrentlyFetchingFloating = false;
        return true;
    }
    adminFetchMoreFloating() {
        if (this.adminCurrentlyFetchingStudents)
            return;
        if (this.adminStudentsNameFilter !== consts.ADMIN_NO_FILTER) {
            if (!this.adminHasNoMoreFloatingToFetch['search'][this.adminStudentsNameFilter])
                this.adminFetchFloating();
        }
        else if (!this.adminHasNoMoreFloatingToFetch["no_filter"])
            this.adminFetchFloating();
    }

    setAdminShowAllStudents(newAdminShowAllStudents) {
        // changed to consts. instead of true/false // // if ((all && !this.adminShowAllStudents) || (!all && this.adminShowAllStudents)) // if new value (all) is not like current value (this.adminShowAllStudents)
        if (newAdminShowAllStudents !== this.adminShowAllStudents) {
            runInAction(() => {
                this.adminShowAllStudents = newAdminShowAllStudents
            })
        }
    }

    setAdminNameFilter(name) {
        runInAction(() => {
            this.adminStudentsNameFilter = name.length ? name : consts.ADMIN_NO_FILTER;
        })
    }

    setAdminGradeFilter(grade) {
        runInAction(() => {
            this.adminStudentsGradeFilter = grade.length ? ClassesUtils.englishGradesObj[grade] : consts.ADMIN_NO_FILTER;
        })
    }
    setAdminClassIndexFilter(classIndex) {
        runInAction(() => {
            this.adminStudentsClassIndexFilter = classIndex.length ? classIndex : consts.ADMIN_NO_FILTER;
        })
    }
    resetAdminStudentsFilters() {
        runInAction(() => {
            this.adminStudentsClassIndexFilter = consts.ADMIN_NO_FILTER;
            this.adminStudentsGradeFilter = consts.ADMIN_NO_FILTER;
            // this.adminStudentsNameFilter = consts.ADMIN_NO_FILTER; // new itzuv
            this.adminShowAllStudents = consts.ADMIN_STUDENTS_ALL; // new itzuv

        })
    }

    updateStudentInfo(studentId, studentInfo, cb) {
        if (typeof studentInfo !== 'object' || Array.isArray(studentInfo) || !Object.keys(studentInfo).length || typeof studentId !== "number") {
            return;
        }
        if (studentInfo.clas) { //change format of class edit var for server 
            studentInfo.Class = { classIndex: studentInfo.clas.substr(2, 1), grade: ClassesUtils.convertToEnglishGrades(studentInfo.clas.substr(0, 1)) }
            delete studentInfo.clas
        }
        const studentsChangesList = {}
        studentsChangesList[studentId] = studentInfo
        this.studentsSaveChanges(studentsChangesList, [], cb) //format: { studentId: {lastName, phoneNumber1, Class: {classIndex, grade}} }
        //that's IT
    }

    toDeleteStudent(studentId) { //plural!!! if gets many students (array) then will pass straight away
        this.studentsSaveChanges({}, Array.isArray(studentId) ? studentId : [studentId])
        return
    }

    async studentsSaveChanges(studentsChanges = {}, studentsToDelete = [], cb) {
        let [res, err] = await Auth.superAuthFetch(`/api/Students/adminStudentsUpdate`,
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ data: studentsChanges, studentsToDelete }) }
        )
        if (err) {
            if (err.error && err.error.message && typeof err.error.message === "string" && err.error.message.split(";") && err.error.message.split(";").length == 2) {
                const msgSplit = err.error.message.split(";")
                const error = msgSplit[1] || t("try_again_later")
                if (cb && typeof cb === "function") cb(error)
                return;
            }
            this.cnt["studentsSaveChanges"] ? this.cnt["studentsSaveChanges"]++ : this.cnt["studentsSaveChanges"] = 1;
            if (this.cnt["studentsSaveChanges"] < 3) {
                setTimeout(() => { this.studentsSaveChanges(studentsChanges, studentsToDelete, cb) }, 1000);
                return; //recursion
            }
            const msgSplit = err.error && err.error.message && typeof err.error.message === "string" ? err.error.message.split(";") : []
            const error = err === "NO_INTERNET" ? t("no_internet_info") : (msgSplit.length == 2 ? msgSplit[1] : t("try_again_later"))
            if (cb && typeof cb === "function") cb(error)
            return;
        }

        typeof cb === "function" && cb(consts.SUCCESSFULLY_UPDATED_STUDENT);
        let newFloatingStudents = this.adminFloatingList.filter(s => !studentsToDelete.includes(s.id));
        let newAdminStudentsList = this.adminStudentsList.filter(s => !studentsToDelete.includes(s.id));

        for (let studentId in studentsChanges) {
            const changedStudent = newAdminStudentsList.find(s => s.id == studentId)
            if (changedStudent) {
                const changesStudentPos = newAdminStudentsList.indexOf(changedStudent)
                newAdminStudentsList[changesStudentPos] = Object.assign(newAdminStudentsList[changesStudentPos], studentsChanges[studentId])
            }
            else {
                const changedStudent = newFloatingStudents.find(s => s.id == studentId)

                if (changedStudent) {
                    const changesStudentPos = newFloatingStudents.indexOf(changedStudent)
                    if (changedStudent.classId === null && studentsChanges[studentId]?.Class?.classIndex) {//this student now have a class (before he didn't).
                        newAdminStudentsList.unshift(Object.assign(newFloatingStudents[changesStudentPos], studentsChanges[studentId]));
                        newFloatingStudents.splice(changesStudentPos, 1);
                        this.adminFloatingIDs = this.adminFloatingIDs.filter(id => id !== studentId);
                        this.adminFetchedSIds.push(studentId);
                    }
                    else {//update the student
                        newFloatingStudents[changesStudentPos] = Object.assign(newFloatingStudents[changesStudentPos], studentsChanges[studentId])
                    }
                }
            }
        }

        runInAction(() => {
            this.adminStudentsList = newAdminStudentsList;
            this.adminFloatingList = newFloatingStudents;
            this.studentChangesList = {};
            this.studentsToDeleteList = [];
            this.selectedAdminStudents = []
        })
    }

    async updateMultStudentsClass(studentsIds, newClass, cb) {
        let [res, err] = await Auth.superAuthFetch(`/api/Students/updateMultStudentsClass`,
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ studentsIds, newClass }) }
        )
        if (err) {
            this.cnt["updateMultStudentsClass"] ? this.cnt["updateMultStudentsClass"]++ : this.cnt["updateMultStudentsClass"] = 1;
            if (this.cnt["updateMultStudentsClass"] < 3) {
                setTimeout(() => { this.updateMultStudentsClass(studentsIds, newClass, cb) }, 1000);
                return; //recursion
            }
            const error = err === "NO_INTERNET" ? t("alerts.no_internet_on_action") : t("alerts.internal_error")
            if (cb && typeof cb === "function") cb(error)
            return;
        }
        let newAdminStudentsList = [...this.adminStudentsList];
        let newAdminFloatingList = [...this.adminFloatingList];
        let temp, changesStudentPos, changedStudent;
        for (let i in studentsIds) {
            changedStudent = newAdminStudentsList.find(s => s.id == studentsIds[i])
            if (changedStudent) {
                changesStudentPos = newAdminStudentsList.indexOf(changedStudent)
                newAdminStudentsList[changesStudentPos].classId = null
                newAdminStudentsList[changesStudentPos].Class = { grade: newClass.grade, classIndex: newClass.classIndex }
            }
            else {
                changedStudent = newAdminFloatingList.find(s => s.id == studentsIds[i])
                if (changedStudent) {
                    const changesStudentPos = newAdminFloatingList.indexOf(changedStudent)
                    temp = newAdminFloatingList.splice(changesStudentPos, 1)
                    temp.classId = null
                    temp.Class = { grade: newClass.grade, classIndex: newClass.classIndex }
                    newAdminStudentsList.unshift(temp);
                }
            }
            changedStudent = null;
            changesStudentPos = null;
        }
        runInAction(() => {
            this.adminStudentsList = newAdminStudentsList
            this.adminFloatingList = newAdminFloatingList;
        })
        if (cb && typeof cb === "function") cb(false)
        this.deselectAdminStudents()
    }

    async adminAddStudentsExcel(students, cb) {
        const headersTranslate = STUDENTS_EXCEL_HEADERS_TRANSLATE(t)
        const validHeaders = Object.keys(headersTranslate)
        const newHeaders = Object.values(headersTranslate)
        // const studentsCheckExcelExampleText = t("alerts.another_explenation");

        let headerI = 0;
        let student = {};
        for (let i = 0; i < students.length; i++) {
            student = students[i];
            headerI = 0;

            //change headers to DB names and return false if headers are not valid
            if (!student[t("admin.phone_p_2")] && !student["phoneNumber2"]) {
                student["phoneNumber2"] = ""
            }
            // if (Object.keys(student).length != validHeaders.length) { // checks that the file has the right amount of headers (columns) but with this check we don't know to tell the user what was invalid
            //     cb(false, `כותרות העמודות שבקובץ שגויות, \n${checkExcelExample}`, "STUDENTS");
            //     return;
            // }
            let trimmedProp = "";
            for (let prop in student) { //change headers to DB names
                trimmedProp = prop.trim()
                if (!validHeaders.includes(trimmedProp) && !newHeaders.includes(trimmedProp)) {
                    cb(false, this.makeHeadersErrMsg(trimmedProp, validHeaders), "STUDENTS");
                    return;
                }
                if (!newHeaders.includes(trimmedProp) && typeof headersTranslate[trimmedProp] === "string") { // translate headers to db names (english); else it's already translated somehow
                    Object.defineProperty(student, headersTranslate[trimmedProp], Object.getOwnPropertyDescriptor(student, prop));
                    delete student[prop];
                }
                headerI++
            }
        } //end for
        this.postStudents(students, false, cb)
    }

    makeHeadersErrMsg(invalidHeader, allValidHeaders) { // invalidHeader:string, allValidHeaders: Array
        return `${t("store.found_title2")} "${invalidHeader}",\n${t("store.required")} ${Array.isArray(allValidHeaders) ? (t("store.are") + allValidHeaders.join(", ")) : t("store.in_setting")}`
    }

    adminAddStudentsForm(student, singleParent, cb) {
        this.postStudents([student], singleParent, cb)
    }



    async postStudents(students, singleParent, cb) { // cb is handleStudentsPostSuccess in admin_add_new_instance.js
        let [res, err] = await Auth.superAuthFetch("api/Students/adminAddStudents",
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ students: students, mightNeedTeachersList: !Array.isArray(this.teachersList) || this.teachersList === null, singleParent }) }
        );
        if (err || !res) {
            let error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            cb(false, error, "STUDENTS"); //3rd is download template of excel
            return;
        }
        // check there is no error in res:
        // ( { error: "", value: "" } )
        else if (res.error && typeof res.error === "object" && res.error.errorName) {
            let errorMsg = t("try_again_later")
            switch (res.error.errorName) {
                case 'HEADERS_ERROR':
                    errorMsg = this.makeHeadersErrMsg(res.error.value, Object.keys(consts.STUDENTS_EXCEL_HEADERS_TRANSLATE));
                    break;
                case 'DATA_ERROR':
                    errorMsg = t("validation.part_invalid");
                    let hebHeader = null; // if have header name from res.error, hebHeader will be the problematic header,
                    if (typeof res.error.header === "string") { // have res.error.header (header name)
                        hebHeader = ENG_TO_HEB_STUDENTS_EXCEL_HEADERS(res.error.header, t);
                        errorMsg = `${t("store.the_info")} ${hebHeader ? `${t("store.in_column")} "${hebHeader}"` : t("store.on_of_the_columns")}`
                    }
                    if (res.error.student && typeof res.error.student.firstName === "string" && typeof res.error.student.lastName === "string") { // have res.error.student (student info)
                        errorMsg += ` ${t("store.for_student")}${res.error.student.gender === "FEMALE" ? t("the") : ""} ${res.error.student.firstName || ""} ${res.error.student.lastName || ""} ${t("validation.invalid_male")}`
                    } else if (typeof hebHeader === "string") { // didn't get student info but have the problematic header
                        errorMsg += ` ${t("validation.invalid_one_stident")}`
                    }
                    if (hebHeader && typeof res.error.errorMessage === "string") { // if we know in which header the error occured on, and have the error message (validation rule)- add it to the end of the error message
                        errorMsg += `, "${hebHeader}" ${res.error.errorMessage}`
                    }
                    if (!isNaN(Number(res.error.line))) {
                        errorMsg += ` (${t("store.area")} ${res.error.line})`
                    }
                    break;
            }
            cb(false, errorMsg, "STUDENTS"); //3rd is download template of excel
            return;
        }

        else {

            const studentsListRes = res.newStudents;
            const teachersListRes = res.teachers || null;
            const newClassesList = res.classesList && res.classesList.length ? res.classesList.sort((a, b) => a.grade > b.grade ? 1 : (a.grade < b.grade ? -1 : (a.classIndex > b.classIndex ? 1 : a.classIndex < b.classIndex ? -1 : 0))) : null;
            const existingStudentsListRes = res.existingStudentsThatWereNotCreated || null; // in future --> join existing that we found b4 fetch, and existing that fetch found
            const newStudentsIds = studentsListRes && Array.isArray(studentsListRes) && studentsListRes.length ? studentsListRes.map(s => s.id) : []

            runInAction(() => {
                teachersListRes && (this.teachersList = teachersListRes.sort((a, b) => a.firstName > b.firstName ? 1 : a.firstName < b.firstName ? -1 : a.lastName > b.lastName ? 1 : a.lastName < b.lastName ? -1 : 0))
                this.adminStudentsList = Array.isArray(this.adminStudentsList) && Array.isArray(studentsListRes) ? [...this.adminStudentsList, ...studentsListRes] : studentsListRes;
                this.adminFetchedSIds && this.adminFetchedSIds.length ? this.adminFetchedSIds.push(...newStudentsIds) : this.adminFetchedSIds = newStudentsIds
                // classes
                if (newClassesList && this.adminClassesList && this.adminClassesList.length) {
                    // add new classes to adminClassesList
                    // maybe later, add new classes according to the order (instead of push->sort)
                    const adminClassesListTemp = [...newClassesList, ...this.adminClassesList]
                    adminClassesListTemp.sort(((a, b) => (a.grade === b.grade) ? ((a.classIndex < b.classIndex) ? -1 : (a.classIndex > b.classIndex) ? 1 : 0) : (a.grade < Number(b.grade)) ? -1 : 1));
                    this.adminClassesList = adminClassesListTemp;
                    // add new classes to adminFetchedCIds 
                    this.adminFetchedCIds.push(...newClassesList.map(c => c.id))

                    // update adminFetchMoreClassesByFilter
                    if (!this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter])
                        this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter] = {}
                    if (!this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter][this.adminClassesClassIndexFilter])
                        this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter][this.adminClassesClassIndexFilter] = {}
                    this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter][this.adminClassesClassIndexFilter][this.adminClassesNameFilter] = res.classesList && res.classesList.length == consts.ADMIN_CLASSES_FETCH_LIMIT;
                }
            })
            consts.originalAdminClassesList = Array.isArray(consts.originalAdminClassesList) && Array.isArray(studentsListRes) ? [...consts.originalAdminClassesList, ...studentsListRes] : studentsListRes;
            consts.originalAdminStudentsList = Array.isArray(consts.originalAdminStudentsList) && Array.isArray(studentsListRes) ? [...consts.originalAdminStudentsList, ...studentsListRes] : studentsListRes;
            cb(true, { existing: existingStudentsListRes, createdStudents: studentsListRes, createdClasses: newClassesList, teachersList: teachersListRes || this.teachersList });
        }
    }

    async assignHomeTeacher(classesWHomeTeacher, cb = (err, timeo) => { }) {
        if (!classesWHomeTeacher || !classesWHomeTeacher.length) {
            return;
        }
        let [res, err] = await Auth.superAuthFetch("/api/Classes/assignHomeTeacher",
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ teachersInfo: classesWHomeTeacher }) }, true);
        if (err) {
            this.cnt["assignHomeTeacher"] ? this.cnt["assignHomeTeacher"]++ : this.cnt["assignHomeTeacher"] = 1;
            if (this.cnt["assignHomeTeacher"] < 3) {
                setTimeout(() => { this.assignHomeTeacher(classesWHomeTeacher, cb) }, 1000);
                return;
            }
            const error = err === "NO_INTERNET" ? t("alerts.internet_not_now_but_classes") : t("alerts.error_not_now_but_classes");
            runInAction(() => {
                cb(error)
            })
            return;
        }
        let newClassWHomeTeacher;
        const newAdminClassesList = this.adminClassesList && this.adminClassesList.length && this.adminClassesList.map(c => { //go over existing adminClassesList and assign the home teachers.
            newClassWHomeTeacher = classesWHomeTeacher.find(cwt => cwt.grade == c.grade && cwt.classIndex == c.classIndex)
            if (newClassWHomeTeacher && newClassWHomeTeacher.firstName && newClassWHomeTeacher.lastName)
                c.Teacher = { firstName: newClassWHomeTeacher.firstName, lastName: newClassWHomeTeacher.lastName }
            return c
        })

        runInAction(() => {
            this.adminClassesList = newAdminClassesList;
        })
        const successMsg = (newAdminClassesList && newAdminClassesList.length > 1 ? t("store.teachers_got_belong") : t("store.teacher_belongs")) + ` ${t("store.succesfuly")}!`
        cb(successMsg, true)
    }

    //* admin classes

    async adminFetchClasses() {
        this.adminCurrentlyFetchingClasses = true;
        let [res, err] = await Auth.superAuthFetch(`/api/Classes/adminFetchClasses?grade=${typeof this.adminClassesGradeFilter === "string" ? this.adminClassesGradeFilter : JSON.stringify(this.adminClassesGradeFilter)}&cIndex=${typeof this.adminClassesClassIndexFilter === "string" ? this.adminClassesClassIndexFilter : JSON.stringify(this.adminClassesClassIndexFilter)}&tName=${this.adminClassesNameFilter !== consts.ADMIN_NO_FILTER ? this.adminClassesNameFilter : JSON.stringify(null)}&fetchedClasses=${JSON.stringify(this.adminFetchedCIds)}`, null, true, true);

        if (err) {
            this.cnt["adminFetchClasses"] ? this.cnt["adminFetchClasses"]++ : this.cnt["adminFetchClasses"] = 1;
            if (this.cnt["adminFetchClasses"] < 3) {
                setTimeout(() => { this.adminFetchClasses() }, 1000);
                return;
            }
            const error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            runInAction(() => {
                this.adminClassesList = error;
            })
            this.cnt["adminFetchClasses"] = 0;
            return false;
        }
        runInAction(() => {
            let newAdminClassesList = this.adminClassesList && this.adminClassesList.length ? [...this.adminClassesList, ...res.classesList] : res.classesList;
            if (Array.isArray(newAdminClassesList)) this.adminClassesList = newAdminClassesList.sort((a, b) => (a.grade == b.grade) ? ((a.classIndex < b.classIndex) ? -1 : (a.classIndex > b.classIndex) ? 1 : 0) : (a.grade < b.grade) ? -1 : 1);
            this.adminFetchedCIds.push(...res.classesList.map(c => c.id))

            if (!this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter])
                this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter] = {}
            if (!this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter][this.adminClassesClassIndexFilter])
                this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter][this.adminClassesClassIndexFilter] = {}
            this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter][this.adminClassesClassIndexFilter][this.adminClassesNameFilter] = res.classesList && res.classesList.length == consts.ADMIN_CLASSES_FETCH_LIMIT;
        })
        Array.isArray(consts.originalAdminClassesList) && consts.originalAdminClassesList.push(...res.classesList) //only adds. getAdminClassesList assigns at beginning
        this.cnt["adminFetchClasses"] = 0;

        this.adminCurrentlyFetchingClasses = false;
        return true;
    }

    get getAdminClassesList() {
        (async () => {
            if (this.adminClassesList === null && typeof this.adminClassesList !== "string") {
                await this.adminFetchClasses();
                Array.isArray(this.adminClassesList) &&
                    (consts.originalAdminClassesList = Array.from(toJS(this.adminClassesList)))
            }
        })();

        let filteredAdminClasses = this.adminClassesList;

        if (!filteredAdminClasses || filteredAdminClasses === null) return null;

        if (typeof filteredAdminClasses === "string") return filteredAdminClasses;

        if (this.adminClassesGradeFilter !== consts.ADMIN_NO_FILTER) {
            filteredAdminClasses = filteredAdminClasses.filter(c => this.adminClassesGradeFilter == c.grade)
            if (!this.adminCurrentlyFetchingClasses && !this.adminFetchedCGrades.includes(this.adminClassesGradeFilter)) {
                this.adminFetchClasses()
            }
        }

        if (this.adminClassesClassIndexFilter !== consts.ADMIN_NO_FILTER) {
            filteredAdminClasses = filteredAdminClasses.filter(c => c.classIndex == this.adminClassesClassIndexFilter)
            if (!this.adminCurrentlyFetchingClasses && !this.adminFetchedCClassIndexes.includes(this.adminClassesClassIndexFilter)) {
                this.adminFetchClasses()
            }
        }

        if (this.adminClassesNameFilter !== consts.ADMIN_NO_FILTER) {
            let regexFilter = new RegExp("^" + this.adminClassesNameFilter, "i");
            filteredAdminClasses = filteredAdminClasses.filter(c => c.Teacher && c.Teacher.firstName && c.Teacher.lastName && (regexFilter.test(c.Teacher.firstName) || regexFilter.test(c.Teacher.lastName) || regexFilter.test(c.Teacher.firstName + " " + c.Teacher.lastName)));
            if (!this.adminCurrentlyFetchingClasses && !this.adminFetchedCRegexes.includes(this.adminClassesNameFilter)) {
                this.adminFetchClasses()
            }
        }

        return filteredAdminClasses;
    }

    async handleAdminClassesScroll() {

        if (!this.adminCurrentlyFetchingClasses && this.adminHasMoreClassesToFetch) this.adminFetchClasses();
    }
    get adminHasMoreClassesToFetch() {
        return this.adminFetchMoreClassesByFilter[this.adminClassesGradeFilter][this.adminClassesClassIndexFilter][this.adminClassesNameFilter]
    }

    // admin classes editing

    updateClasses(classChanges = {}, classId, classesToDelete = [], cb) {
        const classesChangesList = {}
        classesChangesList[classId] = classChanges
        this.classesSaveChanges(classesChangesList, classesToDelete || [], cb)
        //that's IT
    }

    async classesSaveChanges(classesChangesList = {}, classesToDelete = [], cb) {
        for (let i in classesToDelete) {
            classesToDelete[i] = Number(classesToDelete[i])
        } // change to number
        let [res, err] = await Auth.superAuthFetch('/api/Classes/updateClasses',
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ classesChangesList: classesChangesList, classesToDeleteList: classesToDelete || [] }) }, true); //classesChangesList in the format of : {grade, classIndex, teacherName}
        if (err) {
            this.cnt["classesSaveChanges"] ? this.cnt["classesSaveChanges"]++ : this.cnt["classesSaveChanges"] = 1;
            if (err.error && err.error.message !== "CLASS_COLLISION" && this.cnt["classesSaveChanges"] < 3) {
                setTimeout(() => { this.classesSaveChanges(classesChangesList, classesToDelete, cb) }, 1000);
                return;
            }
            this.cnt["classesSaveChanges"] = 0;
            const error = err === "NO_INTERNET" ? t("alerts.no_internet_right_now") : ((err.error && err.error.message === "CLASS_COLLISION") ? t("alerts.class_exist") : t("try_again_later"));
            typeof cb === "function" && cb(error)
            return;
        }

        let newAdminClassesList = this.adminClassesList.filter(c => c && !classesToDelete.includes(Number(c.id))); // change each c.id to Number, cos if c.id is for some reason a string and classesToDelete have numbers, (or vice-versa) it won't match and we do want it to match
        // let newAdminStudentsList = this.adminStudentsList.map(s => s && classesToDelete.includes(Number(s.classId))); // same ^
        for (let classId in classesChangesList) {
            if (classesChangesList[classId]["teacherName"]) { //format to {Teacher:{firstName, lastName}}
                const names = classesChangesList[classId]["teacherName"].split("!")
                classesChangesList[classId].Teacher = { firstName: names[0] || "", lastName: names[1] || "" }
                delete classesChangesList[classId]["teacherName"]
            }
            const changedClass = newAdminClassesList.find(c => c.id == classId)
            if (changedClass) {
                const changesClassPos = newAdminClassesList.indexOf(changedClass)
                newAdminClassesList[changesClassPos] = Object.assign(newAdminClassesList[changesClassPos], classesChangesList[classId])
            }
        }
        let floatings = [];
        newAdminClassesList = newAdminClassesList.sort((a, b) => (a.grade == b.grade) ? ((a.classIndex < b.classIndex) ? -1 : (a.classIndex > b.classIndex) ? 1 : 0) : (a.grade < b.grade) ? -1 : 1);
        let newAdminStudentsList = !Array.isArray(this.adminStudentsList) || !this.adminStudentsList.length
            ? null
            : this.adminStudentsList.filter(stud => {
                if (!isNaN(Number(stud.classId)) && classesToDelete.includes(Number(stud.classId))) {//student become floating student.
                    stud.classId = null
                    delete stud.Class
                    floatings.push(stud);
                    this.adminFloatingIDs.push(stud.id);
                    this.adminFetchedSIds = this.adminFetchedSIds.filter(id => id !== stud.id);
                    return false;
                }
                return true;
            })

        runInAction(() => {
            this.adminClassesList = newAdminClassesList;
            this.adminFloatingList.push(floatings);
            newAdminStudentsList && (this.adminStudentsList = newAdminStudentsList)
        })
        typeof cb === "function" && cb(false)
        return
    }

    toDeleteClass(classId, cb) {
        this.classesSaveChanges({}, [classId], cb)
        return
    }

    handleAdminStudentsCheck(sId) {
        const checkedValues = this.selectedAdminStudents.includes(sId) //adds the class index to the array and removes the class index if it is already there 
            ? this.selectedAdminStudents.filter(v => v !== sId)
            : [...this.selectedAdminStudents, sId];
        runInAction(() => {
            this.selectedAdminStudents = checkedValues;
        })
    }

    deselectAdminStudents() {
        runInAction(() => {
            this.selectedAdminStudents = []
        })
    }

    get getCheckedAdminStudents() {
        return this.selectedAdminStudents;
    }


    adminAddClassesExcel(allClasses, cb) {
        const newHeaders = consts.CLASSES_EXCEL_HEADERS;
        const validHeaders = consts.HEBREW_CLASSES_EXCEL_HEADERS;
        const classes = [];
        let headerI = 0;
        let clas;
        let headerTrimmed = "";
        // const checkInstructions = t("alerts.another_explenation");
        for (let i = 0; i < allClasses.length; i++) { //go over data
            clas = allClasses[i];
            headerI = 0;
            //change headers to DB names and return false if header is not valid ^^
            for (let header in clas) {
                headerTrimmed = header.trim();
                // if (headerTrimmed !== validHeaders[headerI] && headerTrimmed !== newHeaders[headerI]) {
                //     cb(false, `הכותרת ${headerTrimmed} שבקובץ שגויה,\nהכותרות המבוקשות הן ${validHeaders.join(", ")}`, "CLASSES");
                //     return;
                // }
                Object.defineProperty(clas, newHeaders[headerI], Object.getOwnPropertyDescriptor(clas, header));
                delete clas[header];
                headerI++
            }
            if (!this.adminClassesList.find((c) => c.grade == ClassesUtils.englishGradesObj[clas.grade] && c.classIndex == clas.classIndex)) { // add classes from file to classes:Array which are not in this.adminClassesList (classes is an array with only new classes to post)
                classes.push(clas);
            }
        }
        if (!classes.length) {
            cb(false, t("alerts.all_calsses_exist"));
            return;
        }

        this.postClasses(classes, allClasses, cb)
    }

    async adminAddClassesForm(classData, cb) {
        let [res, err] = await Auth.superAuthFetch("/api/Classes/AdminAddClassForm/",
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ classData }) }
            , true);
        if (err) {
            let error = t("try_again_later");
            if (err === "NO_INTERNET")
                error = t("alerts.register_no_internet")
            else if (err.error && err.error.message) {
                switch (err.error.message) {
                    case "CLASS_EXISTS":
                        error = t("alerts.class_registered")
                        break;
                }
                cb(false, error)
                return;
            }
        }
        cb(true, { msg: t("alerts.class_reg_suc"), existingClasses: res.newClass })
        let newAdminClassesList = this.adminClassesList;
        Array.isArray(newAdminClassesList) ? newAdminClassesList.push(res.newClass) : newAdminClassesList = res.newClass;
        newAdminClassesList = newAdminClassesList.sort((a, b) => (a.grade == b.grade) ? ((a.classIndex < b.classIndex) ? -1 : (a.classIndex > b.classIndex) ? 1 : 0) : (a.grade < b.grade) ? -1 : 1);
        runInAction(() => {
            this.adminClassesList = newAdminClassesList
        })
    }


    async postClasses(classes, allClasses, cb) {
        let [res, err] = await Auth.superAuthFetch("/api/Classes/adminAddClasses",
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ newClasses: classes, mightNeedTeachersList: !Array.isArray(this.teachersList) || this.teachersList === null }) }
            , true);
        if (err || !res) {
            let error = t("try_again_later");
            if (err === "NO_INTERNET")
                error = t("no_internet_info")
            else if (err.error && err.error.message) {
                console.log('err: ', err);
                let errorName = Array.isArray(err.error.details) && err.error.details[0] && err.error.details[0].message ? err.error.details[0].message : err.error.message
                switch (errorName) {
                    case "HOME_TEACHER_ERROR":
                        error = `${t("alerts.problem_with_home_teacher")}${Array.isArray(err.error.details) && err.error.details[1] && typeof err.error.details[1].message === "string" ? ` ${err.error.details[1].message}` : ""}.\n ${t("alerts.attention_teacher")}.`
                        break;
                    case "DATA_ERROR":
                        error = `${t("alerts.part_valid")},\n ${t("alerts.another_explenation")}`
                        break
                    case "HEADERS_ERROR":
                        error = `${t("alerts.column_title_invalid")},\n ${t("alerts.another_explenation")}`
                        break
                }
            }
            cb(false, error, "CLASSES"); //download template
            return;
        }
        else if (res.error && typeof res.error === "object") {
            let error = t("alerts.upload_classes_file_error");
            switch (res.error.errorName) {
                case 'DATA_ERROR':
                    error = t("alerts.error_one_class_file");
                    let hebHeader;
                    if (res.error.class && typeof res.error.class === "object") {
                        if (res.error.class.grade && res.error.class.classIndex) {
                            error += ` ${t("store.for_class")} ${res.error.class.grade} ${res.error.class.classIndex}, `
                        }
                        if (typeof res.error.class.teacherFirstName === "string") {
                            error += `${t("store.for_home_teacher")} ${res.error.class.teacherFirstName} ${typeof res.error.class.teacherLastName === "string" ? res.error.class.teacherLastName : ""}`
                        }
                    }
                    if (typeof res.error.header === "string") { // have res.error.header (header name)
                        hebHeader = ENG_TO_HEB_CLASSES_EXCEL_HEADERS(res.error.header, t);
                        error += `\n${t("store.in_column")}: "${hebHeader}"`;
                    }
                    if (!isNaN(Number(res.error.line))) {
                        error += ` ( ${t("store.area")} ${res.error.line} )`
                    }
                    if (typeof res.error.errorMessage === "string") {
                        error += `.\n ${typeof hebHeader === "string" && hebHeader.length ? `"${hebHeader}"` : ""} ${res.error.errorMessage}`;
                    }
            }
            cb(false, error, "CLASSES"); //download template
            return;
        }
        else {

            const classesListRes = res.newClasses;
            const teachersListRes = res.teachers;
            const existingClassesListRes = Array.isArray(res.existingClassesThatWereNotCreated) && Array.isArray(allClasses) ? [...res.existingClassesThatWereNotCreated, ...allClasses.filter(clas => classes.indexOf(clas) < 0)] : []; //join existing that we found b4 fetch, and existing that fetch found
            let newAdminClassesList = this.adminClassesList && this.adminClassesList.length ? [...this.adminClassesList, ...classesListRes] : classesListRes;
            if (Array.isArray(newAdminClassesList)) newAdminClassesList = newAdminClassesList.sort((a, b) => (a.grade == b.grade) ? ((a.classIndex < b.classIndex) ? -1 : (a.classIndex > b.classIndex) ? 1 : 0) : (a.grade < b.grade) ? -1 : 1);
            runInAction(() => {
                teachersListRes && (this.teachersList = teachersListRes.sort((a, b) => a.firstName > b.firstName ? 1 : a.firstName < b.firstName ? -1 : a.lastName > b.lastName ? 1 : a.lastName < b.lastName ? -1 : 0))
                this.adminClassesList = newAdminClassesList
                consts.originalAdminClassesList = consts.originalAdminClassesList !== null && Array.isArray(classesListRes) ? [...consts.originalAdminClassesList, ...classesListRes] : classesListRes;
            });
            Array.isArray(classesListRes) ? cb(true, { msg: classesListRes.length && classesListRes.length > 1 ? t("alerts.classes_reg_suc") : t("alerts.class_reg_suc"), existingClasses: existingClassesListRes }) : cb(true, t("alerts.upload_classes_file_error"))
            return;
        }
    }

    setAdminClassesNameFilter(name) {
        runInAction(() => {
            this.adminClassesNameFilter = name.length ? name : consts.ADMIN_NO_FILTER;
        })
    }

    setAdminClassesGradeFilter(grade) {
        runInAction(() => {
            this.adminClassesGradeFilter = grade.length ? ClassesUtils.englishGradesObj[grade] : consts.ADMIN_NO_FILTER;
        })
    }
    setAdminClassesClassIndexFilter(classIndex) {
        runInAction(() => {
            this.adminClassesClassIndexFilter = classIndex.length ? classIndex : consts.ADMIN_NO_FILTER;
        })
    }

    resetAdminClassesFilters() {
        runInAction(() => {
            this.adminClassesClassIndexFilter = consts.ADMIN_NO_FILTER;
            this.adminClassesGradeFilter = consts.ADMIN_NO_FILTER;
            this.adminClassesNameFilter = consts.ADMIN_NO_FILTER;
        })
    }

    get useStudentsShowMoreFilters() {
        return [this.adminStudentsTableShowFilters, this.setAdminStudentsTableShowFilters]
    }

    setAdminStudentsTableShowFilters = (newVal) => { // is being used as a react state, cos changed from useState to mobx, so another component can get this information
        runInAction(() => {
            if (typeof newVal === "function") {
                this.adminStudentsTableShowFilters = newVal(this.adminStudentsTableShowFilters)
            }
            else this.adminStudentsTableShowFilters = newVal
        })
    }

} // end of class 

decorate(StudentsStore, {
    error: observable,
    studentsList: observable,

    studentsFilter: observable,
    filteredStudents: computed,
    setStudentsFilter: action,
    // currentlyFetching: observable, //mobx observable-computed trouble

    gradeSelected: observable,
    indexSelected: observable,
    classesList: observable,
    classes: computed,
    sort: observable,

    hebGrades: observable,
    getHebrewGrades: computed,

    adminStudentsList: observable,
    getAdminStudentsList: computed,

    selectedAdminStudents: observable,
    handleAdminStudentsCheck: action,
    getCheckedAdminStudents: computed,

    alterStudentInfo: action,
    studentChangesList: observable,
    studentsToDeleteList: observable,
    postStudents: action,
    teachersList: observable,
    assignHomeTeacher: action,

    adminStudentsGradeFilter: observable,
    adminStudentsClassIndexFilter: observable,
    adminStudentsNameFilter: observable,

    setAdminGradeFilter: action,
    setAdminClassIndexFilter: action,
    setAdminNameFilter: action,
    resetAdminStudentsFilters: action,

    getAdminClassesList: computed,
    adminClassesList: observable,

    classesChangesList: observable,
    classesToDeleteList: observable,
    postClassesSuccess: observable,
    postStudentsSuccess: observable,

    adminShowAllStudents: observable,
    adminClassesClassIndexFilter: observable,
    adminClassesGradeFilter: observable,
    adminClassesNameFilter: observable,

    setAdminShowAllStudents: action,
    setAdminClassesGradeFilter: action,
    setAdminClassesClassIndexFilter: action,
    setAdminClassesNameFilter: action,

    useStudentsShowMoreFilters: computed,
    adminStudentsTableShowFilters: observable,
    setAdminStudentsTableShowFilters: action,

    adminFloatingIDs: observable,
    adminFloatingList: observable,
    // adminCurrentlyFetchingFloating:observable,


});

let studentsstore = new StudentsStore;//= window.studentsstore
export default studentsstore;