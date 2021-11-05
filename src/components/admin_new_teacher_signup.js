import React, { useCallback, useRef } from 'react';
import { inject, observer } from 'mobx-react'
import { useTranslate } from '../translation/GPi18n';

import { convertStudentGenderToEng as convertTeacherGenderToEng } from '../consts/GenderOptionsLowerCased'
import { AdminTextInput } from '../generic-components/admin-textInput';
import { AdminDD } from '../generic-components/admin-dropdown';
import DarkBackgroundBehindPopup from './dark_background_behind_popup';
import AdminNewUserMessagePopup from './admin_new_user_message_popup';

import { regexes } from '../consts/consts'

import './CSS/admin_new_teacher_signup.scss'


let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms
const AdminNewTeacherSignup = (props) => {
    const { t } = useTranslate();
    let submitting = useRef(false).current;

    const [vals, setVals] = React.useState({});
    const [errs, setErrs] = React.useState([]);
    const [helperText, setHelperText] = React.useState([]);

    const [postErrorPopup, setPostErrorPopup] = React.useState([]);

    const [openGradeDD, setOpenGradeDD] = React.useState(null); // grades drop down
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time
    const [selectedGradeItem, SetSelectedGradeItem] = React.useState('');

    const validFields = ['firstName', 'lastName', 'email', 'password', 'confirmPW', 'gender']
    // added to regexes in consts.js // const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ //for create new user and for reset pw



    const setErrOnField = (field, msg = false) => {
        let errTemp = [...errs];
        errTemp[field] = true;
        setErrs(errTemp);
        if (!msg) return;
        let helperTextTemp = [...helperText]
        helperTextTemp[field] = msg;
        setHelperText(helperTextTemp)
    }

    const getGenders = useCallback(() => ['', t("genders.male"), t("genders.female"), t("genders.other")].map(gender => ({ key: "k" + gender, value: convertTeacherGenderToEng[gender], name: gender })), []) // should happen once, cos should never change

    const handleChange = (e, field) => {
        let value = e && e.target ? e.target.value : (e && e.currentTarget ? e.currentTarget.value : '') //syntheticError ?!

        if (field === "firstName" || field === "lastName") {
            if (!(regexes.FIRST_LAST_NAME.test(value)) && value !== "") return;
        }
        let newVals = { ...vals };
        newVals[field] = value;
        setVals(newVals);

        setErrs([])
        setHelperText([])
    }
    const handleDDBlur = () => {
        if (!openGradeDD) return;
        clearTimeout(ddTO);
        setOpenGradeDD(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleDDClick = (ddType) => () => {
        clearTimeout(ddTO);
        setOpenGradeDD(v => v ? !v : ddType);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }
    const handleDDChange = (item, field) => {
        SetSelectedGradeItem(item);
        setVals(v => ({ ...v, [field]: item.value }));
        setErrs([]);
    }

    const handleSubmit = (newUserData) => {
        if (submitting) return;
        submitting = true;
        setErrs([]);
        setHelperText([]);

        // check if fields in data are empty
        for (let i in validFields) {
            if (!newUserData[validFields[i]] || !newUserData[validFields[i]].length) {
                setErrOnField(validFields[i])
                submitting = false;
                return;
            }
        }

        const { firstName, lastName, email, password: pw, confirmPW } = newUserData;
        //////////////////////////////////
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
                    setErrOnField(`${i == 0 ? 'first' : 'last'}Name`, t("validation.name_must_contain"));
                    submitting = false;
                    return
                }
            }
        }
        newUserData[`firstName`] = newUserData[`firstName`].trim()
        newUserData[`lastName`] = newUserData[`lastName`].trim()

        //validate email
        let emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
        if (!email || !email.length) {
            setErrOnField('email', t("validation.enter_mail"));
            submitting = false;
            return;
        }
        else if (!emailRE.test(email)) {
            setErrOnField('email', t("validation.wrong_mail"));
            submitting = false;
            return;
        }

        //validate pw
        if (!pw || !pw.length) {
            setErrOnField('password', t("validation.enter_psw"));
            submitting = false;
            return;
        }
        else if (pw.length < 8) {
            setErrOnField('password', t("validation.psw_min_length"));
            submitting = false;
            return;
        }
        else if (!regexes.PASSWORD.test(pw)) {
            setErrOnField('password', t("validation.psw_must_contain"));
            submitting = false;
            return;
        }

        //validate confirm pw
        if (!confirmPW || !confirmPW.length) {
            setErrOnField('confirmPW', t("validation.psw_again"));
            submitting = false;
            return;
        }
        if (confirmPW !== pw) {
            setErrOnField('confirmPW', t("validation.psw_no_match"));
            submitting = false;
            return;
        }
        //////////////////////////////////


        props.UsersStore.adminNewUser(newUserData, (err = false) => {
            submitting = false;
            if (typeof err === "string") {
                setPostErrorPopup([<DarkBackgroundBehindPopup />, <AdminNewUserMessagePopup err={err} closeFather={props.closePopups} closeSelf={closeErrorPopup} noErrors={() => { setErrs([]); setHelperText([]) }} />]);
                return;
            }
            else if (!err) { //success
                setVals({});
                try {
                    props.UsersStore.addToAdminTeachersList([{ teacherFirstName: newUserData.firstName, teacherLastName: newUserData.lastName, teacherGender: newUserData.gender.toUpperCase(), email: newUserData.email }]);
                } catch (e) { };
                props.openPopups(t("pop_up.succes_add_user"), "ERROR", [null, null, null], true);
            }
            else if (err.error && err.error.message) {
                const messageArr = err.error.message.split(';')
                if (messageArr.length !== 2) {
                    setPostErrorPopup([<DarkBackgroundBehindPopup />, <AdminNewUserMessagePopup err={true} closeFather={props.closePopups} closeSelf={closeErrorPopup} noErrors={() => { setErrs([]); setHelperText([]) }} />])
                    return;
                }
                errorOnField(...messageArr)
            }
            else setPostErrorPopup([<DarkBackgroundBehindPopup />, <AdminNewUserMessagePopup err={true} closeFather={props.closePopups} closeSelf={closeErrorPopup} noErrors={() => { setErrs([]); setHelperText([]) }} />])
        })
    }

    const errorOnField = (field, msg = false) => {
        if (!validFields.includes(field)) {
            setPostErrorPopup([<DarkBackgroundBehindPopup />, <AdminNewUserMessagePopup err={t("validation.internal_error")} closeFather={props.closePopups} closeSelf={closeErrorPopup} errorOnField={null} />])
            return;
        }
        let errsTemp = [...errs];
        errsTemp[field] = true;
        setErrs(errsTemp)
        if (msg) {
            let helperTextTemp = [...helperText]
            helperTextTemp[field] = msg
            setHelperText(helperTextTemp)
        }
    }

    const closeErrorPopup = () => {
        setPostErrorPopup([])
    }

    return (
        <div className="admin_popups admin-new-instance-signup-container" id="admin-new-teacher-signup-container">
            <h6 className="new-instance-title">{t("superadmin.menu.add_one_teacher_action")}</h6>
            <div className="admin-new-instance-form-container" id="admin-new-teacher-names-container" >
                <AdminTextInput label={`${t("signup.first_name_of_teacher")}:`} error={errs['firstName']} helperText={helperText['firstName']} value={vals['firstName']} onChange={(e) => { handleChange(e, 'firstName') }} />
                <AdminTextInput label={`${t("signup.last_name_of_teacher")}:`} error={errs['lastName']} helperText={helperText['lastName']} value={vals['lastName']} onChange={(e) => { handleChange(e, 'lastName') }} />
            </div>
            <div id="teacherNameInfo" >{t("signup.uniqe")}</div>

            <div className="admin-new-instance-form-container email-container">
                <AdminTextInput label={`${t("admin.teachers.teacher_email")}:`} error={errs['email']} helperText={helperText['email']} value={vals['email']} onChange={(e) => { handleChange(e, 'email') }} dir="ltr" />
            </div>

            <div className="admin-new-instance-form-container admin-new-instance-input">
                <div className="bold teacher-gender">{t("gender")}</div>
                <AdminDD
                    showDDItems={openGradeDD ? openGradeDD === 'gender' : openGradeDD}
                    handleDDBlur={handleDDBlur}
                    handleDDClick={handleDDClick("gender")}
                    ddItems={getGenders()}
                    selectedItem={selectedGradeItem || ""}
                    isError={errs['gender'] || null}
                    handleItemclick={(item) => { handleDDChange(item, "gender") }}
                    arrowAnimation={arrowAnimation}
                    className="admin-new-instance-dropdown"
                    itemsContainerClassName="admin-new-instance-dropdown-items"
                />
            </div>

            <div className="admin-new-instance-form-container">
                <AdminTextInput label={`${t("admin.create_school_admin")}:`} error={errs['password']} helperText={helperText['password']} value={vals['password']} onChange={(e) => { handleChange(e, 'password') }} />
                <AdminTextInput label={`${t("sign_up.psw_verify")}:`} error={errs['confirmPW']} helperText={helperText['confirmPW']} value={vals['confirmPW']} onChange={(e) => { handleChange(e, 'confirmPW') }} />
            </div>

            <div className="new-instance-buttons-container" >
                <div className="cancelAdminForm" onClick={props.closePopups}> {t("cancel")} </div>
                <div className="saveAdminForm" onClick={() => { handleSubmit(vals) }}> {t("end")} </div>
            </div>
            {postErrorPopup ? postErrorPopup.map(p => p) : null}
        </div>
    );
}

export default inject("UsersStore")(observer(AdminNewTeacherSignup));
