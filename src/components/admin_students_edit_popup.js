import React, { useMemo, useRef } from 'react';
import { inject, observer } from 'mobx-react'
import { useTranslate } from '../translation/GPi18n';

import { Checkbox } from '@material-ui/core';

import ClassesUtils from './ClassesUtils';
import GenderOptionsLowerCased, { convertStudentGenderToEng } from '../consts/GenderOptionsLowerCased'
import { regexes } from '../consts/consts';

import { AdminTextInput } from '../generic-components/admin-textInput';
import { AdminDD } from '../generic-components/admin-dropdown';
import { useConsts } from '../contexts/constsContext';


let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms

let phoneNumErr = 0;
const StudentsEditPopup = (props) => {
    const { STUDENTS_EXCEL_HEADERS_TRANSLATE, EXCEL_HEADERS, SUCCESSFULLY_UPDATED_STUDENT, GET_HEBREW_GRADES } = useConsts();
    const { t } = useTranslate();
    let submitting = useRef(false).current;

    const defaultClas = useMemo(() => (props.student.Class && props.student.Class.grade && props.student.Class.classIndex ? `${GET_HEBREW_GRADES[props.student.Class.grade - 1]} ${props.student.Class.classIndex}` : ""), [props.student.Class]);
    const [formValues, setFormValues] = React.useState({ clas: defaultClas, firstName: props.student.firstName, lastName: props.student.lastName });

    const [errs, setErrs] = React.useState([]);
    // const [helperText, setHelperText] = React.useState([]); // merged helperText with ers 

    const [errMessage, loadingAtSubmit] = useMemo(() => [errs?.general, errs?.load], [errs]);
    const isFemale = useMemo(() => (props.student.gender.toLowerCase() === GenderOptionsLowerCased.FEMALE), [])

    const [oneNumber, setOneNumber] = React.useState(false);

    const [openDDFilters, setOpenDDFilters] = React.useState(null); // grades and class index drop down filters
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time
    const [ddSelectedItems, setDDSelectedItems] = React.useState(() => (typeof props.student.gender === "string"
        ? { 'gender': { value: props.student.gender.toLowerCase(), name: t("genders." + props.student.gender.toLowerCase()) }, 'clas': { value: defaultClas, name: defaultClas } }
        : { 'clas': { value: defaultClas, name: defaultClas }, gender: { value: "", name: "" } }));

    const classItems = useMemo(() => {
        let grades = props.StudentsStore.getHebrewGrades;
        if (!grades || (grades && !grades.length)) {
            return [];
        }
        grades.sort((a, b) => b - a);
        const classesOptions = [];
        let cls;
        let grade;
        for (let i in grades) {
            grade = grades[i]
            const classesInGrade = ClassesUtils.collapseClassList(grade);
            for (let j in classesInGrade) {
                cls = classesInGrade[j];
                classesOptions.push({ key: "k" + cls, divideAbove: (Number(j) === 0 && Number(i) !== 0), value: cls, name: cls }); // divideAbove when first grade, but not for the first ever grade (dont want a line at the top of the drop down)
                // could switch divideAbove with divideUnder: (Number(j) === classesInGrade.length - 1 && Number(i) !== grades.length - 1)
            }
        }
        if (!props.student.Class)
            classesOptions.unshift({ key: "no-class-key-fjd", value: "", name: "---" })

        return classesOptions;
    }, [props.StudentsStore.getHebrewGrades])

    const genderItems = useMemo(() => {
        return ['', t("genders.male"), t("genders.female"), t("genders.other")].map(gender => ({ key: "k" + gender, value: convertStudentGenderToEng[gender], name: gender }))
    }, [])

    const handleOneNumber = () => {
        setOneNumber(v => !v);
        setErrs(er => ({ ...er, ['phoneNumber2']: null }));
        setFormValues(v => ({ ...v, ['phoneNumber2']: "" }));
        // setHelperText(ht => ({ ...ht, ['phoneNumber2']: null }));
    }

    const handleDDBlur = () => {
        if (!openDDFilters) return;
        clearTimeout(ddTO);
        setOpenDDFilters(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }
    const handleDDClick = (ddType) => () => {
        clearTimeout(ddTO);
        setOpenDDFilters(v => v ? !v : ddType);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }
    const handleDDItemclick = (item, field) => {
        setDDSelectedItems(selected => ({ ...selected, [field]: item }));
        setFormValues(v => ({ ...v, [field]: item.value }));
        setErrs([]);
    }

    const handleChange = (e, field) => {
        const value = e && e.currentTarget ? e.currentTarget.value : (e?.target?.value);
        if (field === "firstName" || field === "lastName") {
            if (value && !(regexes.FIRST_LAST_NAME.test(value))) {
                return;
            }
        }
        setFormValues(v => ({ ...v, [field]: value }));
        setErrs([]);
    };

    const handleSubmit = (vals) => {
        const finalFormValues = { ...vals } //! check if this worked
        setErrs({});
        if (submitting) return;
        submitting = true;
        // delete (finalFormVals.) clas values that haven't changed (.clas and defaultClas are strings (== "א 1"))
        if (finalFormValues.clas === defaultClas) {
            delete finalFormValues.clas;
        }
        if (finalFormValues.firstName === props.student.firstName) { // if hasnt changed
            delete finalFormValues.firstName;
        }
        if (finalFormValues.lastName === props.student.lastName) { // if hasnt changed
            delete finalFormValues.lastName;
        }
        // אין בדיקה שיש ערך בכל שדה, בגלל שזה עריכה ובעריכה אין ערך בשדות שלא השתנו
        const names = {}
        if (finalFormValues.firstName !== undefined) names.firstName = finalFormValues.firstName // if .firstName didnt change, it would have been deleted above. i.e either they're undefined, or we need to check that finalFormValues.firstName are valid
        if (finalFormValues.lastName !== undefined) names.lastName = finalFormValues.lastName // if .lastName didnt change, it would have been deleted above. i.e either they're undefined, or we need to check that finalFormValues.lastName are valid
        let currNameVali;
        for (let nameKey in names) {
            currNameVali = names[nameKey]
            if (currNameVali.length < 2) {
                setErrOnField(nameKey, t("validation.name_min_length"));
                submitting = false;
                return;
            }
            else if (currNameVali.length > 20) {
                setErrOnField(nameKey, t("validation.name_max_length"));
                submitting = false;
                return;
            }
            else {
                let res = regexes.FIRST_LAST_NAME.test(currNameVali);
                if (!res) {
                    setErrOnField(nameKey, t("validation.only_letters"));
                    submitting = false;
                    return
                }
            }
            finalFormValues[nameKey] = finalFormValues[nameKey].trim()
        }

        //validate phone numbers
        const nums = {}
        finalFormValues.phoneNumber1 && (nums.phoneNumber1 = finalFormValues.phoneNumber1)
        !oneNumber && finalFormValues.phoneNumber2 && (nums.phoneNumber2 = finalFormValues.phoneNumber2)
        let currNum;
        for (let phoneKey in nums) {
            currNum = nums[phoneKey]
            const valid = new RegExp(regexes.PHONE_NUMBER, "i").test(currNum);
            if (!valid) {
                phoneNumErr++;
                if (phoneNumErr == 3)
                    setErrOnField(phoneKey, t("validation.check_format"));
                else setErrOnField(phoneKey, t("validation.invalid_phone"));
                submitting = false;
                return;
            }
        }
        phoneNumErr = 0;

        if (finalFormValues.gender && !/female|FEMALE|male|MALE|other|OTHER/.test(finalFormValues.gender)) {
            setErrOnField("gender");
            submitting = false;
            return
        }

        if (!finalFormValues || typeof finalFormValues !== "object" || !Object.keys(finalFormValues).length) {
            props.closePopups();
            return;
        }

        let loadCnt = 0;
        const load = () => {
            setErrs(errTemp => ({ "load": (!errTemp.load || errTemp.load.length === 3) ? "." : (errTemp.load + ".") }));
            dotTimeout = setTimeout(load, loadCnt === 0 ? 300 : 500)
            loadCnt = (loadCnt + 1) % 3;
        }
        let dotTimeout = setTimeout(load, 500);
        props.StudentsStore.updateStudentInfo(props.student.id, finalFormValues, err => {
            submitting = false;
            clearTimeout(dotTimeout);
            if (SUCCESSFULLY_UPDATED_STUDENT === err) {
                props.closePopups();
                return;
            }
            const invalidHebField = Object.keys(STUDENTS_EXCEL_HEADERS_TRANSLATE).find(hebKey => STUDENTS_EXCEL_HEADERS_TRANSLATE[hebKey] === err);
            const msg = EXCEL_HEADERS.includes(err) ? t("alerts.value_to_change") + invalidHebField + t("validation.invalid") : t("validation.internal_error")
            // props.openPopups(msg, "ERROR", [null, null, null], true) // so values are not lost for user..(!)
            setErrs(_errTemp => ({ "general": msg, [err]: true }));
        })
    }
    const setErrOnField = (field, msg = true) => {
        setErrs(_errTemp => ({ [field]: msg }));
        // removed helperText :
        //* if (!msg) return;
        //* setHelperText(helperTextTemp => ({ ...helperTextTemp, [field]: msg })) 
    }

    return (
        <div className="admin_popups admin-new-instance-signup-container" id="students_edit_popup">
            <div className="new-instance-title new-student-title"> {`${isFemale ? t("opennings_msg.the_student_F") : t("opennings_msg.the_student_M")} ${props.student.firstName} ${props.student.lastName}`}</div>

            <div className="admin-new-instance-form-container">
                <AdminTextInput label={`${t("signup.first_name")}:`} value={formValues['firstName'] || ""} /* defaultValue={props.student.firstName} */ /*-- dont need this, cos added it to formValues's initialValue */ error={errs['firstName']} helperText={errs['firstName']} onChange={(e) => { handleChange(e, 'firstName') }} />
                <AdminTextInput label={`${t("signup.last_name")}:`} value={formValues['lastName'] || ""} /* defaultValue={props.student.lastName} */ /*-- dont need this, cos added it to formValues's initialValue */ error={errs['lastName']} helperText={errs['lastName']} onChange={(e) => { handleChange(e, 'lastName') }} />
            </div>

            <div className="admin-new-instance-form-container">
                <div className="admin-new-instance-input">
                    <div>{t("home_class")}:</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === 'clas' : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick("clas")}
                        ddItems={classItems}
                        selectedItem={ddSelectedItems["clas"] || {}}
                        isError={errs["clas"] || null}
                        handleItemclick={(item) => { handleDDItemclick(item, "clas") }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-edit-student-dropdown-items"
                    />
                </div>
                <div className="admin-new-instance-input">
                    <div>{t("gender")}:</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === 'gender' : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick("gender")}
                        ddItems={genderItems}
                        selectedItem={ddSelectedItems['gender'] || {}}
                        isError={errs['gender'] || null}
                        handleItemclick={(item) => { handleDDItemclick(item, "gender") }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-edit-student-dropdown-items"
                    />
                </div>
            </div>

            <div className="admin-new-instance-form-container">
                <AdminTextInput label={`${t("place_holder.parent1")}:`} value={formValues['phoneNumber1'] || ""} defaultValue={props.student.phoneNumber1} error={errs['phoneNumber1']} helperText={errs['phoneNumber1']} onChange={(e) => { handleChange(e, 'phoneNumber1') }} />
                <AdminTextInput disabled={oneNumber} label={`${t("place_holder.parent2")}:`} value={formValues['phoneNumber2'] || ""} defaultValue={props.student.phoneNumber2} error={errs['phoneNumber2']} helperText={errs['phoneNumber2']} onChange={(e) => { handleChange(e, 'phoneNumber2') }} />
                {/* <AdminTextInput label="מספר טלפון הורה 2:" value={formValues['phoneNumber2'] || ""} error={errs['phoneNumber2']} helperText={errs['phoneNumber2']} onChange={(e) => { handleChange(e, 'phoneNumber2') }} /> */}
            </div>

            <div id="singleParent-container">
                <Checkbox id="singleParentCheckbox" color="default" label="phoneNumber2" onClick={handleOneNumber} checked={oneNumber} />
                <label htmlFor="singleParentCheckbox" >{t("pop_up.one_parent")}</label>
            </div>

            <div className="admin-new-class-form-container admin-new-instance-input admin-new-instance-errMessage">{errMessage}</div>

            <div className="new-instance-buttons-container">
                <button className="cancelAdminForm" onClick={props.closePopups}> {loadingAtSubmit ? "" : t("cancel")} </button>
                <button className="saveAdminForm" onClick={() => { handleSubmit({ ...formValues }) }}> {loadingAtSubmit || t("save")} </button>
            </div>
        </div>
    );
}

export default inject("StudentsStore")(observer(StudentsEditPopup));
