import React from 'react';

import TextField from '@material-ui/core/TextField';


import './CSS/superadmin_reset_gps_school.scss'
import { Button } from '@material-ui/core';
import { useTranslate } from '../translation/GPi18n';


const SAResetGPsSchool = (props) => {
    const { t } = useTranslate();
    const [allSchools, setAllSchools] = React.useState(false)
    const [inputVal, setInputVal] = React.useState('');
    const [inputErr, setInputErr] = React.useState('');

    const handleSubmit = () => {
        let res = allSchools ? "ALL_SCHOOLS" : inputVal;
        if (res !== "ALL_SCHOOLS") {
            if (Number(inputVal.length) !== 6) {
                setInputErr(t("errors.school_code.length"))
                return;
            }
            if (isNaN(Number(inputVal))) {
                setInputErr(t("errors.school_code.digits"))
                return;
            }
        }
        props.handleSchoolResponse(res)
    }

    return (
        <div className="admin_popups" id="superadmin_reset_gps" >
            <h6>{t("superadmin.clean.school_to_clean")} :</h6>
            <br />
            <TextField disabled={allSchools} error={inputErr} helperText={inputErr ? inputErr : ''} id="school-code-input" value={inputVal} variant="outlined" onChange={(e) => {
                setInputVal(e.target.value)
            }}
            />
            <br />
            <br />
            <div>
                <input type="radio" onClick={() => { setAllSchools(allSchools => !allSchools) }} checked={allSchools} id="all-schools-radio-button" />
                <label for="all-schools-radio-button">{t("superadmin.clean.all_schools")}</label>
            </div>
            <br />
            <div className="buttonsCont" id="buttons-container">
                <Button className="cancelAdminForm" onClick={() => { props.openPopups(null) }} >{t("cancel")}</Button>
                <Button className={!inputVal.length && !allSchools ? "disabledForm" : "saveAdminForm"} disabled={!inputVal.length && !allSchools} onClick={handleSubmit} >{t("superadmin.clean.zreo")}</Button>
            </div>
        </div>
    );
}

export default SAResetGPsSchool;