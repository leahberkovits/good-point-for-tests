import React from 'react';

import { Button } from '@material-ui/core';
import Auth from '../modules/auth/Auth';
import { useTranslate } from '../translation/GPi18n';


const GoToPhone = (props) => {
    const { t } = useTranslate();
    return (<div style={{ height: "100vh", width: "100vw" }} className="d-flex flex-column justify-content-around align-items-center">
        <div>{t("please_phone")}</div>
        <Button onClick={() => { Auth.logout() }} variant="outlined">{t("login.re_login")}</Button>
        <Button onClick={() => { window.location.reload(false) }} variant="outlined">{t("refresh")}</Button>

    </div>
    );
}

export default GoToPhone