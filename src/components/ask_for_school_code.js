import React from 'react';
import { TextField, Button } from '@material-ui/core';


import DarkBackgroundBehindPopup from './dark_background_behind_popup';


import AskForTeacherName from './ask_for_teacher_name';



import './CSS/ask_for_school_code.scss'
import { useTranslate } from '../translation/GPi18n';



const AskForSchoolCode = (props) => {

    const { t } = useTranslate();

    const [schoolVal, setSchoolVal] = React.useState('')
    const [schoolValErr, setSchoolValErr] = React.useState(null)


    const handleChange = (e) => {
        setSchoolVal(e.target.value)
        if (schoolValErr) setSchoolValErr(null)
    }

    const handleSchoolSubmit = cancel => {
        if (!cancel) props.handleResponseFunc(false)
        if (schoolVal.length != 6) {
            setSchoolValErr(t("errors.school_code.length"))
            return;
        }
        if (isNaN(Number(schoolVal))) {
            setSchoolValErr(t("errors.school_code.digits"))
            return;
        }
        props.handleResponseFunc(schoolVal)
    }



    return (
        <div className="admin_popups" id="ask-for-school-code">
            <label for="school-code" >{t("superadmin.enter_school_code")}</label>
            <TextField error={schoolValErr} helperText={schoolValErr} id="school-code" onChange={handleChange} label={t("school")} size="small" variant="outlined" />
            <div id="buttons-container">
                <Button className="cancelAdminForm" onClick={() => { handleSchoolSubmit(false) }} >{t("cancel")}</Button>
                <Button className={!schoolVal || !schoolVal.length ? "disabledForm" : "saveAdminForm"} disabled={!schoolVal || !schoolVal.length} onClick={handleSchoolSubmit} >{t("next")}</Button>
            </div>
        </div >
    );
}

export default AskForSchoolCode;