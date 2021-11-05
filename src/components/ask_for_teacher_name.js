import React from 'react';

import Auth from '../modules/auth/Auth';

import './CSS/ask_for_teacher_name.scss'


import { Select, Button } from '@material-ui/core';
import { useTranslate } from '../translation/GPi18n';

const AskForTeacherName = (props) => {
    const { t } = useTranslate();
    const [teacherVal, setTeacherVal] = React.useState('');


    const getTeachers = () => {
        let optionsArr = props.teachersList.map(t => {
            return <option key={t.teacherFirstName} value={`${t.teacherFirstName} ${t.teacherLastName}`}>{`${t.teacherFirstName} ${t.teacherLastName}`}</option>
        })
        optionsArr.unshift(<option value='' />)
        return optionsArr;
    }


    const handleTeacherChange = (e) => {
        setTeacherVal(e.target.value);
    }

    const handleTeacherSubmit = (go) => {
        if (!go) {
            props.handleTeacherResponse(false);
            return;
        }
        props.handleTeacherResponse(teacherVal)
    }

    if (props.err || !props.teachersList || !props.teachersList.length) {
        return (
            <div className="admin_popups" id="ask-for-teacher-name-container">
                <div> {props.err || `${t("errors.not_found")} ${t("teachers")}`} </div>
                <Button className="cancelAdminForm" onClick={() => { handleTeacherSubmit(false) }} >{t("got_it")}</Button>
            </div>
        );
    }

    return (
        <div className="admin_popups" id="ask-for-teacher-name-container" >

            <Select
                // className="home-teacher-info-select"
                native
                onChange={handleTeacherChange}
            // inputProps={{ id: 'home-teacher-name-select' }}
            >
                {getTeachers()}
            </Select>
            <div id="buttons-container">
                <button disabled={!teacherVal.length} onClick={handleTeacherSubmit} >{t("superadmin.make_admin_status.make")}</button>
                <button onClick={() => { handleTeacherSubmit(false) }} >{t("cancel")}</button>
            </div>

        </div>
    );
}

export default AskForTeacherName;