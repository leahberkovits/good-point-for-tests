import { observable, decorate, action, computed, runInAction } from 'mobx';
import Auth from '../modules/auth/Auth';
import { NEW_USER_KEYS_ENG } from '../consts/consts';
import { validateNewUser } from '../consts/funcs';
import { convertStudentGenderToEng } from '../consts/GenderOptionsLowerCased';
import { getT } from "../translation/GPi18n";
const t = getT();

class UsersStore {

    name = null;
    isFirstLogin = null;
    isFirstOS = null;
    cnt = {};

    adminFetchRes = null;
    teachersList = null;
    isFirstAdminLogin = null;

    closeFirstLoginMessages = false;
    removeBubble = false
    removeBubbleTO = null
    //admin
    newUserErr = null;
    adminTeachersListFilterVal = null;

    removeSendAGPBubble = (ms = null) => {
        clearTimeout(this.removeBubbleTO)
        if (ms && Number(ms) > 0)
            this.removeBubbleTO = setTimeout(() => {
                runInAction(() => {
                    this.removeBubble = true
                })
            }, ms)
        else {
            runInAction(() => {
                this.removeBubble = true
            })
        }
    }
    removeInstrucBubbleOS = () => {
        runInAction(() => {
            this.isFirstOS = false
        })
    }
    removeInstrucPopups = () => {
        runInAction(() => {
            this.closeFirstLoginMessages = true
        })
    }

    async fetchUserFullName() {
        let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/fullName", null, true, true);
        if (err) {
            this.cnt["fetchUserFullName"] ? this.cnt["fetchUserFullName"]++ : this.cnt["fetchUserFullName"] = 1;
            if (this.cnt["fetchUserFullName"] < 3) {
                setTimeout(() => { this.fetchUserFullName() }, 1000);
                return;
            }
        }
        runInAction(() => {
            this.name = res;
        })
    }
    get fullName() {
        (async () => {
            if (this.name === null) {
                await this.fetchUserFullName()
            }
        })();
        return this.name;
    }

    async fetchIsFirstLogin() {
        let firstLoginLS = localStorage.getItem("firstLogin");
        if ((firstLoginLS !== null) && (firstLoginLS !== undefined) && ((firstLoginLS == "true") || (firstLoginLS == "false"))) { //there is a value in local storage for firstLogin
            runInAction(() => { this.isFirstLogin = firstLoginLS === "false" ? false : true })
            if (firstLoginLS === "true") localStorage.setItem("firstLogin", false)
        }
        else {
            let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/isFirstLogin");
            if (err) {
                this.cnt["fetchIsFirstLogin"] ? this.cnt["fetchIsFirstLogin"]++ : this.cnt["fetchIsFirstLogin"] = 1;
                if (this.cnt["fetchIsFirstLogin"] < 3) {
                    setTimeout(() => { this.fetchIsFirstLogin() }, 1000);
                    return;
                }
                return;
            }
            runInAction(() => {
                this.isFirstLogin = res.firstLogin;
            })
            localStorage.setItem("firstLogin", false)
        }
    }

    get firstLogin() {
        (async () => {
            if (this.isFirstLogin === null) {
                await this.fetchIsFirstLogin()
            }
        })();
        return this.isFirstLogin
    }

    fetchisFirstOpeningSentences() {
        (async () => {
            let firstOSLS = localStorage.getItem("firstOS");
            if ((firstOSLS !== null) && (firstOSLS !== undefined) && ((firstOSLS === "true") || (firstOSLS === "false"))) { //there is a value in local storage for firstLogin
                runInAction(() => { try { this.isFirstOS = JSON.parse(firstOSLS) } catch (err) { } })
                if (firstOSLS) localStorage.setItem("firstOS", false)
            }
            else { //no data in LS
                let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/isFirstOpeningSentences", null, true);
                if (err) {
                    this.cnt["fetchisFirstOpeningSentences"] ? this.cnt["fetchisFirstOpeningSentences"]++ : this.cnt["fetchisFirstOpeningSentences"] = 1;
                    if (this.cnt["fetchisFirstOpeningSentences"] < 3) {
                        setTimeout(() => { this.fetchisFirstOpeningSentences() }, 1000);
                        return;
                    }
                    return;
                }
                runInAction(() => {
                    this.isFirstOS = res.firstOS;
                })
                localStorage.setItem("firstOS", false)
            }
        })();
    }

    get firstOpeningSentences() {
        (async () => {
            if (this.isFirstOS === null) {
                await this.fetchisFirstOpeningSentences()
            }
        })();
        return this.isFirstOS
    }

    async signUp(password, email, firstName, lastName) {
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/signUp?&password=${password}&email=${email}&firstName=${firstName}&lastName=${lastName}`)
        if (err) {
            this.cnt["signUp"] ? this.cnt["signUp"]++ : this.cnt["signUp"] = 1;
            if (this.cnt["signUp"] < 3) {
                setTimeout(() => { this.signUp(password, email, firstName, lastName) }, 1000);
                return;
            }
        }
    }

    async adminFetch() {
        let [res, err] = await Auth.superAuthFetch('/api/CustomUsers/adminAccess')
        runInAction(() => {
            this.adminFetchRes = !(err);
        })
    }

    get isAdmin() {
        (async () => {
            if (this.adminFetchRes === null) {
                await this.adminFetch()
            }
        })();
        return this.adminFetchRes
    }

    async adminTeachersFetch() {
        let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/adminGetTeachers", null, true);
        if (err) {
            this.cnt["adminGetTeachers"] ? this.cnt["adminGetTeachers"]++ : this.cnt["adminGetTeachers"] = 1;
            if (this.cnt["adminGetTeachers"] < 3) {
                setTimeout(() => { this.adminTeachersFetch() }, 1000);
                return;
            }
            const error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
            runInAction(() => {
                this.teachersList = error;
            })
            this.cnt["adminGetTeachers"] = 0;
            return false;
        }
        else runInAction(() => {
            this.teachersList = res.teachersList.sort((a, b) => a.teacherFirstName > b.teacherFirstName ? 1 : a.teacherFirstName < b.teacherFirstName ? -1 : a.teacherLastName > b.teacherLastName ? 1 : a.teacherLastName < b.teacherLastName ? -1 : 0);
        })
    }

    get adminTeachersList() {
        (async () => {
            if (this.teachersList === null) {
                await this.adminTeachersFetch();
            }
        })();
        if (Array.isArray(this.teachersList) && typeof this.adminTeachersListFilterVal === "string" && this.adminTeachersListFilterVal.length) {
            let regexFilter = new RegExp("^" + this.adminTeachersListFilterVal, "i");
            return this.teachersList.filter(t => (regexFilter.test(t.teacherFirstName) || regexFilter.test(t.teacherLastName) || regexFilter.test(t.teacherFirstName + " " + t.teacherLastName)))
        }
        return this.teachersList
    }

    setAdminTeachersSearch(searchVal) {
        runInAction(() => {
            this.adminTeachersListFilterVal = searchVal;
        })
    }

    updateAdminTeachersList(index, firstN, lastN, gender) {
        if (!Array.isArray(this.adminTeachersList) || !this.adminTeachersList.length)
            return;
        runInAction(() => {
            this.adminTeachersList[index].teacherFirstName = firstN;
            this.adminTeachersList[index].teacherLastName = lastN;
            this.adminTeachersList[index].teacherGender = gender;
        })
    }

    async fetchIsFirstAdminLogin() {
        let firstAdminLoginLS = localStorage.getItem("firstAdminLogin");
        if ((firstAdminLoginLS !== null) && (firstAdminLoginLS !== undefined) && ((firstAdminLoginLS === "true") || (firstAdminLoginLS === "false"))) { //there is a value in local storage for firstAdminLogin
            try { runInAction(() => { this.isFirstAdminLogin = JSON.parse(firstAdminLoginLS) }) } catch (err) { }
            if (firstAdminLoginLS === "true") localStorage.setItem("firstAdminLogin", false)
            return;
        }

        let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/isFirstAdminLogin", null, true);
        if (err) {
            this.cnt["isFirstAdminLogin"] ? this.cnt["isFirstAdminLogin"]++ : this.cnt["isFirstAdminLogin"] = 1;
            if (this.cnt["isFirstAdminLogin"] < 3) {
                setTimeout(() => { this.fetchIsFirstAdminLogin() }, 1000);
                return;
            }
            return;
        }
        runInAction(() => {
            this.isFirstAdminLogin = res.firstAdminLogin;
        })
        localStorage.setItem("firstAdminLogin", false)
    }

    get firstAdminLogin() {
        const { isAdmin } = this
        if (isAdmin === null || isAdmin === false) return isAdmin;
        (async () => {
            if (this.isFirstAdminLogin === null) {
                await this.fetchIsFirstAdminLogin()
            }
        })();
        return this.isFirstAdminLogin
    }

    async adminNewUser(userData, cb) { //cb will show errors/success for user
        let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/createNewUser",
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ userData }) }, true);
        if (err) {
            const error = err === "NO_INTERNET" ? t("no_internet_info") : err;
            cb(error)
        }
        else if (res) {
            cb(false) //cb gets an err
        }
    }

    adminAddMultTeachers = async (teachers, NEW_USER_KEYS_HEB, NEW_USER_KEYS_TO_ENG) => {

        //validating teachers obj values and keys:
        let teacher;
        for (let i = 0; i < teachers.length; i++) {
            teacher = teachers[i];
            for (let key in teacher) {
                // * check headers
                key = key.trim();
                if (!NEW_USER_KEYS_ENG.includes(key)) {
                    // not eng key
                    if (!NEW_USER_KEYS_HEB.includes(key)) {
                        // not heb key either!
                        return [null, { error: "INVALID_HEADER", errorMessage: `${t('store.found_title')} ${key}, ${t("store.she_not_valid")}\n${t("store.asked_titles")} ${NEW_USER_KEYS_HEB.join(", ")}` }]
                    }
                    else {
                        // is hebrew
                        // -- translate from eng to heb
                        if (typeof NEW_USER_KEYS_TO_ENG[key] !== "string") { // in case something is wrong and I can't translate the Heb headers to Eng
                            return [null, { error: "ERROR", errorMessage: `${t("store.err_title")} ${key}.\n${t('store.try_again_columns')} ${NEW_USER_KEYS_ENG.join(", ")}` }]
                        }
                        Object.defineProperty(teacher, NEW_USER_KEYS_TO_ENG[key], Object.getOwnPropertyDescriptor(teacher, key));
                        delete teacher[key];
                    }
                }
            }
            // * check teacher data
            // translate heb Gender to English
            const engGender = convertStudentGenderToEng[teacher.gender];
            if (typeof engGender !== "string") {
                return [null, { error: "INVALID_TEACHER", teacher, errorMessage: t("validation.gender_can_be") }];
            }

            teacher.gender = engGender.toUpperCase();
            const valid = validateNewUser(teacher, false, false);
            if (valid !== true) {
                const [errorField, errorMessage] = valid.split(';')
                return [null, { error: "INVALID_TEACHER", teacher, errorField, errorMessage }]
            }
        }

        let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/a-hosafat-morim-moigfamm8fjnv", {
            method: "POST", headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ teachers })
        }, true);
        return new Promise((resolve, reject) => {
            if (err) {
                const error = err === "NO_INTERNET" ? t("no_internet_execute") : err;
                resolve([error]);
                return;
            }
            else if (res) {
                resolve([null, res, teachers])
            }
        })
    }

    addToAdminTeachersList(teachers) {// only if teachersList was fetched (this.teachersList not null - is an array) // teachers: <Array<Teacher>>
        if (!Array.isArray(this.teachersList)) return;
        runInAction(() => {
            this.teachersList = [...this.teachersList, ...teachers]
        })
    }

    async resetPW(oldPass, newPass, cb) {
        const resetPWfields = { OLD_PASS: 'oldPass', NEW_PASS_1: "newPass1", NEW_PASS_2: "newPass2", GENERAL: "general" }
        if (typeof oldPass !== "string") { cb({ error: { message: `${resetPWfields.OLD_PASS};` } }); return; }
        if (typeof newPass !== "string") { cb({ error: { message: `${resetPWfields.NEW_PASS_1};` } }); return; }
        let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/changePassword",
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ oldPass, newPass }) });

        if (err) {
            const error = err === "NO_INTERNET" ? t("no_internet_info") : err;
            cb(error)
            return;
        }
        cb(false)
        // setTimeout(async () => { //give time for user to see the success msg (in admin_change_password_popup.jsx and in change_pw_form.js)
        let _loginRes = await Auth.login(res.email, newPass)
        // GenericTools.safe_redirect("/");
        // }, 1000);
        return;
    }

    async superAdminNewAdmin(adminData, cb) { //cb will show errors/success for user

        let [res, err] = await Auth.superAuthFetch("/api/CustomUsers/createNewAdmin",
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ adminData }) });
        if (err) {
            const error = err === "NO_INTERNET" ? t("no_internet_info") : err;
            cb(error)
        }
        else if (res) {
            cb(false) //cb gets an err
        }
    }


} // end of class 



decorate(UsersStore, {
    name: observable,
    fetchUserFullName: observable,
    fullName: computed,
    isFirstLogin: observable,
    firstLogin: computed,

    isFirstOS: observable,
    firstOpeningSentences: computed,

    adminFetchRes: observable,
    isAdmin: computed,

    teachersList: observable,
    adminTeachersList: computed,
    adminTeachersListFilterVal: observable,
    updateAdminTeachersList: action,
    addToAdminTeachersList: action,
    isFirstAdminLogin: observable,
    firstAdminLogin: computed,

    closeFirstLoginMessages: observable,
    removeInstrucPopups: action,

    removeSendAGPBubble: action,
    removeBubble: observable,
});

let usersstore = new UsersStore;//window.usersstore =
export default usersstore;

