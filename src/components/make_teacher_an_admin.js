import React from 'react';

import Auth from '../modules/auth/Auth';

import AskForSchoolCode from './ask_for_school_code';

import AskForTeacherName from './ask_for_teacher_name';

import DarkBackgroundBehindPopup from './dark_background_behind_popup';
import ErrorPopup from './super_admin_error_popup'
import { Button } from '@material-ui/core';
import { useTranslate } from '../translation/GPi18n';


const MakeTeacherAnAdmin = (props) => {
    const { t } = useTranslate();
    const handleTeacherResponse = teacherVal => {
        if (!teacherVal) {
            props.setPopup(null);
            props.setErrorMsg(t("action_canceled"))
            setTimeout(() => { props.setErrorMsg('') }, 2500)
            return;
        }

        props.setPopup([<ErrorPopup text={`${t("superadmin.make_admin_status.are_you_sure_that")} ${teacherVal} ${t("superadmin.make_admin_status.to_admin")}`} okayText={t("superadmin.make_admin_status.yes_make")} openPopups={props.setPopup} cancelText={t("superadmin.clean.no_cancel")} handlePopupClick={procceed => {
            if (!procceed) {
                props.setPopup(null);
                props.setErrorMsg(t("action_canceled"))
                setTimeout(() => { props.setErrorMsg('') }, 2500)
                return;
            }
            else makeAdmin(teacherVal)


        }} />, <DarkBackgroundBehindPopup />])
    }

    const makeAdmin = async teacherName => {
        let [res, err] = await Auth.superAuthFetch('/api/CustomUsers/makeAdmin',
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ teacherName }) }, true, true);
        if (err) {
            return;
        }
        props.setPopup(null);
        props.setErrorMsg(`${t("superadmin.make_admin_status.teacher")} ${teacherName} ${t("superadmin.make_admin_status.became_admin")}`)
        setTimeout(() => { props.setErrorMsg('') }, 2500)
    }


    const handleSchoolCodeVal = async (schoolCode) => {
        props.setPopup(null)
        if (!schoolCode) {
            props.setErrorMsg(t("got_canceled"));
            setTimeout(() => { props.setErrorMsg('') }, 2500)
            return;
        }
        props.setErrorMsg(t("loading"))

        let error = null;
        let [res, err] = await Auth.superAuthFetch('/api/CustomUsers/makeAdminGetTeachers',
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ schoolCode: schoolCode }) }, true, true);
        if (err) { //if err
            error = t("try_again_later");
        }
        props.setPopup([<AskForTeacherName teachersList={res ? res.t : null} err={error} handleTeacherResponse={handleTeacherResponse} />, <DarkBackgroundBehindPopup />])
    }



    const handleMakeAdminClick = () => {
        props.setPopup([<AskForSchoolCode handleResponseFunc={handleSchoolCodeVal} />, <DarkBackgroundBehindPopup />]);
    }



    return (
        <div>
            <Button variant="outlined" className="super-admin-button" id="make-admin" onClick={handleMakeAdminClick} >{t("superadmin.make_admin")}</Button>
        </div>
    );
}

export default MakeTeacherAnAdmin;