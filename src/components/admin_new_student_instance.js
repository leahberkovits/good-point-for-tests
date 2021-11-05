import React, { useMemo } from 'react';
import { inject, observer } from 'mobx-react'
import { TextField, Select, Button, Checkbox } from '@material-ui/core';

import { regexes } from '../consts/consts';

import { useTranslate } from '../translation/GPi18n';
import { AdminDD } from '../generic-components/admin-dropdown';
import { AdminTextInput } from '../generic-components/admin-textInput';
import { useConsts } from '../contexts/constsContext';


let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms

let phoneNumErr = 0;
let submitting = false;
const AdminNewStudentInstance = (props) => {
    const { t } = useTranslate();
    const { GET_HEBREW_GRADES } = useConsts();
    const [vals, setVals] = React.useState({});
    const [errs, setErrs] = React.useState([]);
    const [helperText, setHelperText] = React.useState([]);
    const [oneNumber, setOneNumber] = React.useState(false);

    const [openDDFilters, setOpenDDFilters] = React.useState(null); // grades and class index drop down filters
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time
    const [ddSelectedItems, setDDSelectedItems] = React.useState({});

    const [postErrorPopup, setPostErrorPopup] = React.useState([]);

    const validFields = ['firstName', 'lastName', 'grade', 'classIndex', 'gender', 'phoneNumber1', 'phoneNumber2']


    const getGrades = useMemo(() => {// grades change
        return GET_HEBREW_GRADES.map((g, i) => ({ key: "k" + i, value: g, name: g }));
    }, [])
    const getClasses = useMemo(() => {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((c, i) => ({ key: "k" + i, value: c, name: c }));
    }, [])
    const getGenders = useMemo(() => {
        return ['', t("genders.male"), t("genders.female"), t("genders.other")].map(gender => ({ key: "k" + gender, value: gender, name: gender }))
    }, [])
    const handleChange = (e, field) => {
        let value = e && e.target ? e.target.value : (e && e.currentTarget ? e.currentTarget.value : '') //syntheticError ?!
        if (field === "firstName" || field === "lastName") {
            if (!(regexes.FIRST_LAST_NAME.test(value)) && value !== "") return;
        }
        setVals(v => ({ ...v, [field]: value }));
        setErrs([])
        setHelperText([])
    }
    const handleDDChange = (item, field) => {
        setDDSelectedItems(selected => ({ ...selected, [field]: item }));
        setVals(v => ({ ...v, [field]: String(item.value) }));
        setErrs([]);
    }

    const handleDDClick = (ddType) => () => {
        clearTimeout(ddTO);
        setOpenDDFilters(v => v ? !v : ddType);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const setErrOnField = (field, msg = false) => {
        setErrs(errTemp => ({ ...errTemp, [field]: true }));
        if (!msg) return;
        setHelperText(helperTextTemp => ({ ...helperTextTemp, [field]: msg }));
    }

    const handleDDBlur = () => {
        if (!openDDFilters) return;
        clearTimeout(ddTO);
        setOpenDDFilters(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleSubmit = (vals) => {
        if (submitting) return
        submitting = true;
        setErrs([])
        setHelperText([])
        const newStudentData = { ...vals }

        let requiredFields = [...validFields]
        if (oneNumber) { requiredFields = requiredFields.filter(f => f !== "phoneNumber2") }
        // check if fields in data are empty
        for (let i in requiredFields) {
            if (!newStudentData[requiredFields[i]] || !newStudentData[requiredFields[i]].length) {
                setErrOnField(requiredFields[i]);
                submitting = false;
                return;
            }
        }

        const { firstName, lastName, phoneNumber1, phoneNumber2 } = newStudentData;

        const bothNames = [firstName, lastName]
        let currNameVali;
        for (let i in bothNames) {
            currNameVali = bothNames[i]
            if (currNameVali.length < 2) {
                setErrOnField(`${i == 0 ? 'first' : 'last'}Name`, t("validation.name_min_length"));
                submitting = false;
                return;
            }
            else if (currNameVali.length > 20) {
                setErrOnField(`${i == 0 ? 'first' : 'last'}Name`, t("validation.name_max_length"));
                submitting = false;
                return;
            }
            else {
                let res = regexes.FIRST_LAST_NAME.test(currNameVali);
                if (!res) {
                    console.log('res:', res)
                    setErrOnField(`${i == 0 ? 'first' : 'last'}Name`, t("validation.name_must_contain"));
                    submitting = false;
                    return
                }
            }
        }
        newStudentData[`firstName`] = newStudentData[`firstName`].trim()
        newStudentData[`lastName`] = newStudentData[`lastName`].trim()

        //validate phone numbers
        const nums = [phoneNumber1]
        !oneNumber && nums.push(phoneNumber2)
        let currNum;
        for (let i in nums) {
            currNum = nums[i]
            const valid = /^([0-9]{3}-?[0-9]{3}-?[0-9]{4})$/i.test(currNum);
            if (!valid) {
                phoneNumErr++;
                if (!isNaN(Number(phoneNumErr)) && Number(phoneNumErr) % 3 == 0)
                    setErrOnField(`phoneNumber${Number(i) + 1}`, t("validation.check_format"));
                else setErrOnField(`phoneNumber${Number(i) + 1}`, t("validation.invalid_phone"));
                submitting = false;
                return;
            }
        }
        phoneNumErr = 0;

        props.openPopups(null, "LOADING")

        if (oneNumber || !newStudentData.phoneNumber2) newStudentData.phoneNumber2 = "" //even tho oneNumber, input might have text there
        props.StudentsStore.adminAddStudentsForm(newStudentData, oneNumber, (...args) => { submitting = false; props.handleStudentsPostSuccess(...args) }) //todo check this works (arrow function)
    }

    const handleOneNumber = () => {
        setOneNumber(v => !v);
        setErrs(er => ({ ...er, ['phoneNumber2']: null }));
        setVals(v => ({ ...v, ['phoneNumber2']: "" }));
        setHelperText(ht => ({ ...ht, ['phoneNumber2']: null }));
    }






    return (
        <div className="admin_popups admin-new-instance-signup-container" >
            <h6 className="new-instance-title new-student-title" >{t("admin.students.add_student")}</h6>
            <div className="admin-new-instance-form-container">
                <AdminTextInput label={`${t("signup.first_name")}:`} value={vals['firstName'] || ""} error={errs['firstName']} helperText={helperText['firstName']} onChange={(e) => { handleChange(e, 'firstName') }} />
                <AdminTextInput label={`${t("signup.last_name")}:`} value={vals['lastName'] || ""} error={errs['lastName']} helperText={helperText['lastName']} onChange={(e) => { handleChange(e, 'lastName') }} />
            </div>

            <div className="admin-new-instance-form-container">
                <div className="admin-new-instance-input" >
                    <div className="bold">{`${t("admin.classes.class_age")}:`}</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === 'grade' : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick('grade')}
                        ddItems={getGrades}
                        selectedItem={ddSelectedItems['grade'] || ""}
                        isError={errs['grade'] || null}
                        handleItemclick={(item) => { handleDDChange(item, 'grade') }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-new-instance-dropdown-items"
                    />
                </div>
                <div className="admin-new-instance-input" >
                    <div className="bold">{`${t("admin.classes.number")}:`}</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === 'classIndex' : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick("classIndex")}
                        ddItems={getClasses}
                        selectedItem={ddSelectedItems["classIndex"] || ""}
                        isError={errs["classIndex"] || null}
                        handleItemclick={(item) => { handleDDChange(item, "classIndex") }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-new-instance-dropdown-items"
                    />
                </div>
            </div>
            <div className="admin-new-instance-form-container admin-new-instance-input">
                <div className="bold">{`${t("gender")}:`}</div>
                <AdminDD
                    showDDItems={openDDFilters ? openDDFilters === 'gender' : openDDFilters}
                    handleDDBlur={handleDDBlur}
                    handleDDClick={handleDDClick("gender")}
                    ddItems={getGenders}
                    selectedItem={ddSelectedItems['gender'] || ""}
                    isError={errs['gender'] || null}
                    handleItemclick={(item) => { handleDDChange(item, "gender") }}
                    arrowAnimation={arrowAnimation}
                    className="admin-new-instance-dropdown"
                    itemsContainerClassName="admin-new-instance-dropdown-items"
                />
            </div>

            <div className="admin-new-instance-form-container">
                <AdminTextInput label={`${t("place_holder.parent1")}:`} value={vals['phoneNumber1'] || ""} error={errs['phoneNumber1']} helperText={helperText['phoneNumber1']} onChange={(e) => { handleChange(e, 'phoneNumber1') }} />
                <AdminTextInput disabled={oneNumber} label={`${t("place_holder.parent2")}:`} value={vals['phoneNumber2'] || ""} error={errs['phoneNumber2']} helperText={helperText['phoneNumber2']} onChange={(e) => { handleChange(e, 'phoneNumber2') }} />
            </div>
            <div id="singleParent-container">
                <Checkbox id="singleParentCheckbox" color="default" label="phoneNumber2" onClick={handleOneNumber} checked={oneNumber} />
                <label htmlFor="singleParentCheckbox" >{t("pop_up.one_parent")}</label>
            </div>

            <div className="new-instance-buttons-container">
                <div className="cancelAdminForm" onClick={props.closePopups}> {t("cancel")} </div>
                <div className="saveAdminForm" onClick={() => { handleSubmit(vals) }}> {t("finish")} </div>
            </div>
            {postErrorPopup ? postErrorPopup.map(p => p) : null}
        </div>
    );
}

export default inject("StudentsStore")(observer(AdminNewStudentInstance));