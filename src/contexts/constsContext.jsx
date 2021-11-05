import React, { useContext, useMemo, useState } from 'react';
import { useTranslate } from '../translation/GPi18n';


export const ConstsContext = React.createContext()

export const useConsts = () => useContext(ConstsContext)
export const classNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
export const ConstsProvider = ({ children }) => {

    const { t, i18n } = useTranslate();
    const lang = i18n.language;
    const grades = useMemo(() => {
        let temp = {};
        classNumbers.forEach(item => temp[t("grades." + item)] = item);
        return temp;

    }, [lang])
    const consts = useMemo(() => {
        return {


            HEBREW_MONTHS: [t("months.january"), t("months.february"), t("months.march"), t("months.april"), t("months.may"), t("months.june"), t("months.july"), t("months.august"), t("months.september"), t("months.october"), t("months.november"), t("months.december")],
            HEBREW_ENGLISH_GRADES: grades,

            GET_HEBREW_GRADES: Object.keys(grades),
            GET_ENGLISH_GRADES: Object.values(grades),


            EXCEL_HEADERS: ["firstName", "lastName", "grade", "classIndex", "phoneNumber1", "phoneNumber2", "gender"],
            HEBREW_EXCEL_HEADERS: [t("signup.first_name"), t("signup.last_name"), t("admin.classes.class_age"), t("admin.classes.number"), t("admin.phone_p_1"), t("admin.phone_p_2"), t("gender")],
            EXAMPLE_STUDENTS_EXCEL_DATA: [t("excel_explanation.first_name_ex"), t("excel_explanation.last_name_ex"), t("grades.1"), "1", "012-345-6789", "0123456789", t("genders.female")],

            CLASSES_EXCEL_HEADERS: ["grade", "classIndex", "teacherFirstName", "teacherLastName"],
            HEBREW_CLASSES_EXCEL_HEADERS: [t("admin.classes.class_age"), t("admin.classes.number"), t("excel_explanation.T_first_name"), t("excel_explanation.T_last_name")],
            EXAMPLE_CLASSES_EXCEL_DATA: [t("grades.1"), "1", t("excel_explanation.t_first_name_ex"), t("excel_explanation.t_last_name_ex")],
            EXAMPLE2_CLASSES_EXCEL_DATA: [t("grades.2"), "1"],

            EXCEL_TEMPLATE_STUDENTS_NAME: "students_example_file.xlsx",
            EXCEL_TEMPLATE_CLASSES_NAME: "classes_example_file.xlsx",

            STUDENTS_EXCEL_HEADERS_TRANSLATE: { [t("signup.first_name")]: "firstName", [t("signup.last_name")]: "lastName", [t("admin.classes.class_age")]: "grade", [t("admin.classes.number")]: "classIndex", [t("admin.phone_p_1")]: "phoneNumber1", [t("admin.phone_p_2")]: "phoneNumber2", [t("gender")]: "gender" },


            ADMIN_NO_FILTER: null,

            ADMIN_POINTS_CLASSES_SORT: "ADMIN_POINTS_CLASSES_SORT",
            ADMIN_POINTS_TEACHERS_SORT: "ADMIN_POINTS_TEACHERS_SORT",
            ADMIN_POINTS_DATE_SORT: "ADMIN_POINTS_DATE_SORT",

            originalAdminStudentsList: null,
            originalAdminClassesList: null,

            ADMIN_STUDENTS_FETCH_LIMIT: 10,// 50,
            ADMIN_CLASSES_FETCH_LIMIT: 10,// 50,
            ADMIN_POINTS_FETCH_LIMIT: 10,// 50,

            ADMIN_STUDENTS_FLOATING: "FLOATIN_GFDSA",
            // ADMIN_STUDENTS_WITH_CLASS: "WITH_CLASS_FDSAvc", // maybe later
            ADMIN_STUDENTS_ALL: "ALL_nvaTEZ",

            ADMIN_POINTS_TABLE: "u", // used for Router path
            ADMIN_STUDENTS_TABLE: "v", // used for Router path
            ADMIN_CLASSES_TABLE: "x", // used for Router path
            ADMIN_TEACHERS_TABLE: "i", // used for Router path
            ADMIN_SETTINGS: "w", // used for Router path

            JUST_GO_BACK: 99, // no specific url, just history.goBack()

            SUCCESSFULLY_UPDATED_STUDENT: "SUCCESSFULLY_UPDATED_STUDENT",
        }
    }, [lang])
    const ENG_TO_HEB_STUDENTS_EXCEL_HEADERS = (engHeader) => {
        let index = consts.EXCEL_HEADERS.findIndex(eng => engHeader === eng);
        if (!isNaN(Number(index))) return consts.HEBREW_EXCEL_HEADERS[index];
        return null
    }
    const ENG_TO_HEB_CLASSES_EXCEL_HEADERS = (engHeader) => {
        let index = consts.CLASSES_EXCEL_HEADERS.findIndex(eng => engHeader === eng);
        if (!isNaN(Number(index))) return consts.HEBREW_CLASSES_EXCEL_HEADERS[index];
        return null
    }


    const regexes = {
        FIRST_LAST_NAME: /^[a-zA-Zא-ת \u0621-\u064A '"`”’-]+$/,
        PHONE_NUMBER: /^(0[1-9][0-9]-?[0-9]{3}-?[0-9]{4})$/,
        GENDER: /female|FEMALE|male|MALE|other|OTHER/,
        PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
        GOOD_POINT: "([a-zA-Z0-9א-ת\u0621-\u064A ,\-:\"'!._\r?\n])+" // must be a string!!!s
    }
    const validationRules = {
        textRule: { type: 'string', format: { pattern: regexes.FIRST_LAST_NAME, flags: "i", message: "invalid chars" } }, //validation for firstName
        gradeRule: { type: 'string', format: { pattern: '[אבגדהוזח]', flags: "i", message: "invalid chars" } }, //validation for grade // grades change //TODOOOOO reut shani
        classIndexRule: { type: 'number', numericality: { greaterThan: 0, lessThanOrEqualTo: 15 } }, //validation for classIndex
        phoneNumberRule: { type: 'string', format: { pattern: regexes.PHONE_NUMBER, flags: "gim", message: "invalid chars" } }, //validation for phoneNumber
        genderRule: { type: 'string', format: { pattern: "female|FEMALE|male|MALE|other|OTHER", flags: "gim", message: "invalid chars" } } //validation for phoneNumber
    }

    const validationRulesWithErrMsgs = {
        firstNameErrMSg: t("validation.names_err_msg"), firstName: validationRules.textRule,
        lastNameErrMsg: t("validation.names_err_msg"), lastName: validationRules.textRule,
        gradeErrMsg: t("validation.grade_err_msg"), grade: validationRules.gradeRule,
        classIndexErrMsg: t("validation.class_err_msg"), classIndex: validationRules.classIndexRule,
        phoneNumber1ErrMsg: t("validation.phone1_err_msg"), phoneNumber1: validationRules.phoneNumberRule,
        phoneNumber2ErrMsg: t("validation.phone2_err_msg"), phoneNumber2: validationRules.phoneNumberRule,
        genderErrMsg: t("gender_err_msg"), gender: validationRules.genderRule // not used
    }



    const NEW_USER_KEYS_ENG = ["firstName", "lastName", "gender", "email"];
    const NEW_USER_KEYS_HEB = [t("signup.first_name"), t("signup.last_name"), t("gender"), t("login.email")];

    const NEW_USER_KEYS_TO_ENG = { [t("signup.first_name")]: "firstName", [t("signup.last_name")]: "lastName", [t("gender")]: "gender", [t("login.email")]: "email", };
    const NEW_USER_KEYS_TO_HEB = { firstName: t("signup.first_name"), lastName: t("signup.last_name"), gender: t("gender"), email: t("login.email") };



    const ctxValue = {
        ...consts,
        NEW_USER_KEYS_ENG,
        NEW_USER_KEYS_HEB,
        NEW_USER_KEYS_TO_ENG,
        NEW_USER_KEYS_TO_HEB,
        validationRulesWithErrMsgs,
        ENG_TO_HEB_CLASSES_EXCEL_HEADERS,
        ENG_TO_HEB_STUDENTS_EXCEL_HEADERS
    }

    return <ConstsContext.Provider value={ctxValue} >
        {children}
    </ConstsContext.Provider>
}

// * example:
// / first of all get the context: 
// const genAlertCtx = useGenAlert()
// open an alert: (nice text at the bottom left of the screen)
// genAlertCtx.openGenAlert({ text: "user info was updated successfully" });
// open a popup: (dialog with the use)
// genAlertCtx.openGenAlert({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } });
// / and to get the user's answer add:
// / 1:
// genAlertCtx.openGenAlert({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } }, (answer) => {  } );
// / or 2:
// let answer = await genAlertCtx.openGenAlertSync({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } });

// need help? -shani