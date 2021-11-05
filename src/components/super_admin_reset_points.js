import React from 'react';


import Auth from '../modules/auth/Auth';


import SAResetGPsSchool from './superadmin_reset_gps_school';

import ErrorPopup from './super_admin_error_popup';

import DarkBackgroundBehindPopup from './dark_background_behind_popup';


import './CSS/super_admin_reset_points.scss'
import { Button } from '@material-ui/core';
import { useTranslate } from '../translation/GPi18n';





const ResetPoints = (props) => {
    const { t } = useTranslate()
    let fetchCnt = 0;

    const handlePointsPopupResponse = async (popupRes, schoolRes) => {
        if (!popupRes) {
            props.setErrorMsg(t("action_canceled"));
            setTimeout(() => { props.setErrorMsg(null) }, 3000)
            return;
        }
        props.setErrorMsg(t("loading"));
        let [res, err] = await Auth.superAuthFetch('/api/GoodPoints/superAdminResetGps',
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ schoolCode: schoolRes }) }, true);

        if (err) {
            fetchCnt++;
            if (fetchCnt < 3) {
                setTimeout(() => { handlePointsPopupResponse(schoolRes) }, 1000);
                return;
            }
            props.setErrorMsg(err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later"));
        } else if (res) {
            fetchCnt = 0;
            let msg = schoolRes === 'ALL_SCHOOLS' ? t("superadmin.clean.all_schools_points") : `${t("superadmin.clean.one_school_points")} ${schoolRes} ${t("got_reset")}`
            props.setErrorMsg(msg)
            setTimeout(() => { props.setErrorMsg(null) }, 5000)
        }
    }


    const handleResetClick = () => {
        props.setPopup([<SAResetGPsSchool handleSchoolResponse={(schoolRes) => {
            /* are u sure? if yes --> calling handlePointsPopupResponse ^^ */
            props.setPopup([<ErrorPopup text={schoolRes === "ALL_SCHOOLS" ? t("superadmin.clean.are_u_sure_all_school") : `${t("superadmin.clean.are_u_sure_this_school")} ${schoolRes}?`} okayText={t("superadmin.clean.yes_clean")} cancelText={t("superadmin.clean.no_cancel")} handlePopupClick={(res) => { handlePointsPopupResponse(res, schoolRes) }} openPopups={props.setPopup} />, <DarkBackgroundBehindPopup />])
        }} openPopups={props.setPopup} />, <DarkBackgroundBehindPopup />]);
    }




    return (
        <div>
            <Button variant="outlined" className="super-admin-button" id="reset-points" onClick={handleResetClick} >{t("superadmin.clean_points")}</Button>
        </div>
    );
}

export default ResetPoints;