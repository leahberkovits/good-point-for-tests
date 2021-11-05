import React from 'react';
import { inject, observer } from 'mobx-react'
import { useTranslate } from '../translation/GPi18n';

import { TextField, Select, Button } from '@material-ui/core';

import { convertStudentGenderToEng as convertTeacherGenderToEng } from '../consts/GenderOptionsLowerCased'
import { regexes } from '../consts/consts';

import DarkBackgroundBehindPopup from './dark_background_behind_popup';
import ErrorPopup from './super_admin_error_popup'
import SuperAdminNewAdminPopup from './super_admin_new_admin_popup'

import './CSS/create_a_school_admin.scss'


const CreateASchoolAdmin = (props) => {
    const { t } = useTranslate();
    const [vals, setVals] = React.useState({});
    const [errs, setErrs] = React.useState([]);
    const [helperText, setHelperText] = React.useState([]);


    const [postErrorPopup, setPostErrorPopup] = React.useState([]);

    const validFields = ['firstName', 'lastName', 'email', 'schoolCode', 'password', 'confirmPW', 'gender']
    // added to regexes in consts.js // const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ //for create new user and for reset pw



    const getGenders = () => {
        return ['', t("genders.male"), t("genders.female"), t("genders.other")].map(gender => <option key={gender} value={convertTeacherGenderToEng[gender]} >{gender}</option>)
    }

    const handleChange = (e, field) => {
        let newVals = { ...vals };
        newVals[field] = e.target.value;
        setVals(newVals);
        setErrs([])
        setHelperText([])
    }

    const handleSubmit = () => {
        let errsTemp = [...errs];
        setErrs([])
        setHelperText([])
        const newUserData = { ...vals }

        // check if fields in data are empty
        for (let i in validFields) {
            if (!newUserData[validFields[i]] || !newUserData[validFields[i]].length) {
                errsTemp[validFields[i]] = true
                setErrs(errsTemp);
                return;
            }
        }
        const { firstName, lastName, email, schoolCode, password: pw, confirmPW } = newUserData;
        //////////////////////////////////
        const bothNames = [firstName, lastName]
        let currNameVali;
        for (let i in bothNames) {
            currNameVali = bothNames[i]
            if (currNameVali.length < 2) {
                errorOnField(`${Number(i) === 0 ? 'first' : 'last'}Name`, t("validation.name_min_length"));
                return;
            }
            else if (currNameVali.length > 20) {
                errorOnField(`${Number(i) === 0 ? 'first' : 'last'}Name`, t("validation.name_max_length"));
                return;
            }
            else {
                let res = /[\u0590-\u05FF  \u0621-\u064A \"\-\'a-zA-Z]*/i.exec(currNameVali);
                if (res[0] !== currNameVali) {
                    errorOnField(`${Number(i) === 0 ? 'first' : 'last'}Name`, t("validation.only_letters"));
                    return
                }
            }
        }

        newUserData[`firstName`] = newUserData[`firstName`].trim()
        newUserData[`lastName`] = newUserData[`lastName`].trim()
        //validate email
        let emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
        if (!emailRE.test(email)) {
            errorOnField('email', t("validation.wrong_mail"));
            return;
        }

        //validate school code
        if (schoolCode.length !== 6) {
            errorOnField('schoolCode', t("validation.code_length"));
            return;
        }
        const nSchoolCode = Number(schoolCode);
        if (isNaN(nSchoolCode)) {
            errorOnField('schoolCode', t("validation.only_numbers"));
            return;
        }

        //validate pw
        if (pw.length < 8) {
            errorOnField('password', t("validation.psw_min_length"));
            return;
        }
        if (!regexes.PASSWORD.test(pw)) {
            errorOnField('password', t("validation.psw_must_contain"));
            return;
        }

        //validate confirm pw
        if (confirmPW !== pw) {
            errorOnField('confirmPW', t("validation.psw_no_match"));
            return;
        }


        props.UsersStore.superAdminNewAdmin(newUserData, (err = false) => {
            if (typeof err === "string") {
                setPostErrorPopup([<DarkBackgroundBehindPopup />, <SuperAdminNewAdminPopup err={err} closeFather={closePopup} closeSelf={closeErrorPopup} noErrors={() => { setErrs([]); setHelperText([]) }} />])
                return;
            }
            else if (!err) { //success
                props.setPopup([<ErrorPopup text={t("pop_up.succes_add_admin")} okayText={t("close")} openPopups={props.setPopup} />, <DarkBackgroundBehindPopup closeOnClick={true} handleClick={closePopup} />])
                let formBtns = Array.from(document.getElementsByClassName('newAdminBtns'))
                if (formBtns && formBtns.length)
                    for (let b in formBtns) {
                        formBtns[b].blur();
                    }
            }
            else if (err.error && err.error.message) {
                const messageArr = err.error.message.split(';')
                if (messageArr.length !== 2) {
                    setPostErrorPopup([<DarkBackgroundBehindPopup />, <SuperAdminNewAdminPopup err={true} closeFather={closePopup} closeSelf={closeErrorPopup} noErrors={() => { setErrs([]); setHelperText([]) }} />])
                    return;
                }
                errorOnField(...messageArr)
            }
            else setPostErrorPopup([<DarkBackgroundBehindPopup />, <SuperAdminNewAdminPopup err={true} closeFather={closePopup} closeSelf={closeErrorPopup} noErrors={() => { setErrs([]); setHelperText([]) }} />])
        })
    }

    const errorOnField = (field, msg = false) => {
        if (!validFields.includes(field)) {
            setPostErrorPopup([<DarkBackgroundBehindPopup />, <SuperAdminNewAdminPopup err={t("validation.internal_error")} closeFather={closePopup} closeSelf={closeErrorPopup} errorOnField={null} />])
            return;
        }
        let errsTemp = [...errs];
        errsTemp[field] = true;
        setErrs(errsTemp)
        if (!msg) return;
        let helperTextTemp = [...helperText]
        helperTextTemp[field] = msg
        setHelperText(helperTextTemp)
    }

    const closeErrorPopup = () => {
        setPostErrorPopup([])
    }
    const closePopup = () => {
        props.setPopup(null)
    }





    return (
        <div className="admin_popups" id="new-admin-signup-container">

            <h6>{t("admin.admins.add_new")}</h6>
            <br />
            <TextField error={errs['firstName']} helperText={helperText['firstName']} value={vals['firstName']} onChange={(e) => { handleChange(e, 'firstName') }} size="small" label={t("signup.first_name")} variant="outlined" />
            <br />
            <TextField error={errs['lastName']} helperText={helperText['lastName']} value={vals['lastName']} onChange={(e) => { handleChange(e, 'lastName') }} size="small" label={t("signup.last_name")} variant="outlined" />
            <br />
            <TextField error={errs['email']} helperText={helperText['email']} value={vals['email']} onChange={(e) => { handleChange(e, 'email') }} size="small" label={t("login.email")} variant="outlined" />
            <br />
            <TextField error={errs['schoolCode']} helperText={helperText['schoolCode']} value={vals['schoolCode']} onChange={(e) => { handleChange(e, 'schoolCode') }} size="small" label={t("superadmin.school_code")} variant="outlined" />
            <br />
            <TextField error={errs['password']} helperText={helperText['password']} value={vals['password']} onChange={(e) => { handleChange(e, 'password') }} size="small" label={t("admin.create_school_admin")} variant="outlined" />
            <br />
            <TextField error={errs['confirmPW']} helperText={helperText['confirmPW']} value={vals['confirmPW']} onChange={(e) => { handleChange(e, 'confirmPW') }} size="small" label={t("login.password")} variant="outlined" />

            <br />
        <div htmlFor="new-teacher-gender-select">{t("gender")}</div>
            <Select
                id="new-teacher-gender-select"
                native
                value={vals['gender']}
                error={errs['gender']} helperText={helperText['gender']}
                onChange={(e) => { handleChange(e, 'gender') }}
            >
                {getGenders()}
            </Select>
            <br />

            <div id="new-admin-buttons-container">
                <Button className="newAdminBtns cancelAdminForm" variant="outlined" size="small" onClick={closePopup}> {t("cancel")} </Button>
                <Button className="newAdminBtns saveAdminForm" variant="outlined" size="small" onClick={handleSubmit}> {t("end")} </Button>
            </div>
            {postErrorPopup ? postErrorPopup.map(p => p) : null}

        </div>
    );
}

export default inject("UsersStore")(observer(CreateASchoolAdmin));
