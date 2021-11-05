import { getT } from "../translation/GPi18n";
const d = new Date();
export const getYearOfSelectedMonth = (selectedMonth, currMonth = d.getMonth(), currYear = d.getFullYear()) => {
    /**
     // @Param : selectedMonth - number of month to get it's year //!(1-11) 
     // @Param : currMonth - new Date().getMonth()  //!(1-11) 
     // @Param : currYear - new Date().getFullYear
    */
    return ((currMonth >= 8 && currMonth <= 11) && (selectedMonth >= 0 && selectedMonth <= 7))
        ? (Number(currYear) + 1)
        : (((selectedMonth >= 8 && selectedMonth <= 11) && (currMonth >= 0 && currMonth <= 7)) ? (Number(currYear) - 1) : currYear)
}


export function getUrlParam(param, location) {
    try {
        return new URLSearchParams(location.search).get(param)
    } catch (e) { return null }
}


export function validateNewUser(userData, checkPW = true, genderSelectErr = true) { // if return value is not -true- there is a .split(";") (counting on the fact that the return value in this case is a string) (CustomUser.addTeachers)
    //validate teacher obj
    // userData: { firstName, lastName, gender, email, password }
    // genderSelectErr - if err on gender: return error saying: pick again. if false: return error of not valid gender
    const t = getT();
    const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ //for create new user and for reset pw
    let { gender } = userData;
    if (!gender) return t("validation.gender_choose");
    if (typeof gender !== "string") return genderSelectErr ? t("validation.gender_again") : t("validation.gender_can")
    gender = gender.toUpperCase();
    if (gender !== "MALE" && gender !== "FEMALE" && gender !== "OTHER") { console.log("wrong gender ", gender); return genderSelectErr ? t("validation.gender_again") : t("validation.gender_can") }

    const { firstName, lastName, email, password: pw } = userData;

    //validate name
    const bothNames = [firstName, lastName]
    let currNameVali;
    for (let i in bothNames) {
        currNameVali = bothNames[i]
        if (!currNameVali || !currNameVali.length)
            return `${Number(i) === 0 ? 'first' : 'last'}Name;${t("validation.insert_name")}${Number(i) === 0 ? t("private") : t("family")}`;
        else if (currNameVali.length < 2)
            return `${Number(i) === 0 ? 'first' : 'last'}Name;${t("validation.name_min_length")}`;
        else if (currNameVali.length > 20)
            return `${Number(i) === 0 ? 'first' : 'last'}Name;${t("validation.name_max_length")}`;
        else {
            let res = /[\u0590-\u05FF \u0621-\u064A  \"\-\'a-zA-Z]*/i.exec(currNameVali);
            if (res[0] !== currNameVali) return `${Number(i) === 0 ? 'first' : 'last'}Name;${t("validation.name_must_contain")}`;
        }
    }
    //validate email
    let emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
    if (!email || !email.length) return `email;${t("validation.enter_mail")}`;
    else if (!emailRE.test(email)) return `email;${t("validation.wrong_mail")}`;
    
    if (!checkPW) {
        return true;
    }
    //validate pw
    if (!pw || !pw.length) return `password;${t("validation.enter_psw")}`;
    else if (pw.length < 8) return `password;${t("validation.psw_min_length")}`;
    else if (!PASSWORD_REGEX.test(pw)) return `password;${t("validation.psw_must_contain")}`;
    return true
}
