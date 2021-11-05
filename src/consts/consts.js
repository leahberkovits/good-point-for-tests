// import { getT } from "../translation/GPi18n";
const consts = {
    SCHOOL_SELECTED: -999,
    NO_CLASS_FILTER: 0,
    NO_STUDENTS_FILTER: 0,

    EXCEL_STUDENT_POPUP_KEY: 'excelStudentPopupKey',
    EXCEL_POPUP_BACKGROUND_KEY: 'excelPopupBackgroundKey',

    SMS_EXAMPLE_PAGE_KEY: 'smsPageExampleKey',


    CATEGORY_CLASS_MAME: "nav-link text-center align-middle",
    SELECTED_CATEGORY_CLASS_NAME: "nav-link text-center align-middle active",

    GP_LIST_FETCH_LIMIT: 50,
    STUDENTS_LIST_FETCH_LIMIT: 50,
    GP_BY_STUDENT_FETCH_LIMIT: 50,

    TEXT_BOX_CHAR_LIMIT: 35,


    EXCEL_HEADERS: ["firstName", "lastName", "grade", "classIndex", "phoneNumber1", "phoneNumber2", "gender"],

    CLASSES_EXCEL_HEADERS: ["grade", "classIndex", "teacherFirstName", "teacherLastName"],

    EXCEL_TEMPLATE_STUDENTS_NAME: "students_example_file.xlsx",
    EXCEL_TEMPLATE_CLASSES_NAME: "classes_example_file.xlsx",

    ADMIN_NO_FILTER: null,

    ADMIN_POINTS_CLASSES_SORT: "ADMIN_POINTS_CLASSES_SORT",
    ADMIN_POINTS_TEACHERS_SORT: "ADMIN_POINTS_TEACHERS_SORT",
    ADMIN_POINTS_DATE_SORT: "ADMIN_POINTS_DATE_SORT",

    originalAdminStudentsList: null,
    originalAdminClassesList: null,

    ADMIN_STUDENTS_FETCH_LIMIT: 10,// 50,
    ADMIN_FLOATING_STUDENTS_FETCH_LIMIT: 20,
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
    HEBREW_EXCEL_HEADERS: (t) => [t("signup.first_name"), t("signup.last_name"), t("admin.classes.class_age"), t("admin.classes.number"), t("admin.phone_p_1"), t("admin.phone_p_2"), t("gender")]
}

export default consts;

export const ENG_TO_HEB_STUDENTS_EXCEL_HEADERS = (engHeader, t) => {
    let index = consts.EXCEL_HEADERS.findIndex(eng => engHeader === eng);
    if (!isNaN(Number(index))) return consts.HEBREW_EXCEL_HEADERS(t)[index];
    return null
}
export const ENG_TO_HEB_CLASSES_EXCEL_HEADERS = (engHeader, t) => {
    let index = consts.CLASSES_EXCEL_HEADERS.findIndex(eng => engHeader === eng);
    if (!isNaN(Number(index))) return consts.HEBREW_EXCEL_HEADERS(t)[index];
    return null
}

export const STUDENTS_EXCEL_HEADERS_TRANSLATE = (t) => {
    return { [t("signup.first_name")]: "firstName", [t("signup.last_name")]: "lastName", [t("admin.classes.class_age")]: "grade", [t("admin.classes.number")]: "classIndex", [t("admin.phone_p_1")]: "phoneNumber1", [t("admin.phone_p_2")]: "phoneNumber2", [t("gender")]: "gender" }
}

export const regexes = {
    FIRST_LAST_NAME: /^[a-zA-Zא-ת \u0621-\u064A '"`”’-]+$/,
    PHONE_NUMBER: /^(0[1-9][0-9]-?[0-9]{3}-?[0-9]{4})$/,
    GENDER: /female|FEMALE|male|MALE|other|OTHER/,
    PASSWORD: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    GOOD_POINT: "([a-zA-Z0-9א-ת\u0621-\u064A ,\-:\"'!._\r?\n])+" // must be a string!!!s
}
export const validationRules = {
    textRule: { type: 'string', format: { pattern: regexes.FIRST_LAST_NAME, flags: "i", message: "invalid chars" } }, //validation for firstName
    gradeRule: { type: 'string', format: { pattern: '[אבגדהוזח]', flags: "i", message: "invalid chars" } }, //validation for grade // grades change //TODOOOOO reut shani
    classIndexRule: { type: 'number', numericality: { greaterThan: 0, lessThanOrEqualTo: 15 } }, //validation for classIndex
    phoneNumberRule: { type: 'string', format: { pattern: regexes.PHONE_NUMBER, flags: "gim", message: "invalid chars" } }, //validation for phoneNumber
    genderRule: { type: 'string', format: { pattern: "female|FEMALE|male|MALE|other|OTHER", flags: "gim", message: "invalid chars" } } //validation for phoneNumber
}

export const NEW_USER_KEYS_ENG = ["firstName", "lastName", "gender", "email"];
export const NEW_USER_KEYS_AR = ["اسم شخصي", "اسم عائلة", "جنس", "بريد الكتروني"];

export const USER_BLOCKED_ERROR_CODE = "USER_BLOCKED";
export const PASSWORD_ALREADY_USED_ERROR_CODE = "PASSWORD_ALREADY_USED";
export const block_time_ms_login = 600000;