import React from 'react';

import { Button } from '@material-ui/core';

import Auth from '../modules/auth/Auth';

import ErrorPopup from './super_admin_error_popup';
import DarkBackgroundBehindPopup from './dark_background_behind_popup';
import { useTranslate } from '../translation/GPi18n';




const GradeInc = (props) => {
    let fetchCnt = 0;
    const { t } = useTranslate();

    const popupClassesResponse = async (userRes) => {
        if (!userRes) { return; }
        props.setErrorMsg(t("loading"))
        let [res, err] = await Auth.superAuthFetch('/api/Classes/gradeUp',
            {
                method: "POST",
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({})
            }, true);

        if (err) {
            fetchCnt++;
            if (fetchCnt < 3) {
                setTimeout(() => { popupClassesResponse() }, 1000);
                return;
            }
            props.setErrorMsg(err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later"));
        } else if (res) {
            fetchCnt = 0;
            props.setErrorMsg(t("superadmin.classes_update_success"))
            setTimeout(() => { props.setErrorMsg(null) }, 5000)
        }
    }

    const handleGradeIncClick = () => {
        props.setPopup([<ErrorPopup text={t("superadmin.are_you_sure_grade_up")} okayText={t("update")} cancelText={t("superadmin.not_yet")} handlePopupClick={popupClassesResponse} openPopups={props.setPopup} />, <DarkBackgroundBehindPopup />])
    }

    return (
        <div>
            <Button variant="outlined" className="super-admin-button" id="grades-inc" onClick={handleGradeIncClick}>{t("superadmin.year_over")}</Button>
            <br />
        </div>
    );
}

export default GradeInc;