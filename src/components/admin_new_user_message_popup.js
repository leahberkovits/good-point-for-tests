import React from 'react';

import { inject, observer } from 'mobx-react'


import './CSS/admin_new_user_message_popup.scss'
import { Button } from '@material-ui/core';
import { useTranslate } from '../translation/GPi18n';


const AdminNewUserMessagePopup = (props) => {
    const { t } = useTranslate();
    const defErr = t("validation.internal_error");
    const { err } = props;

    const createMsg = () => {
        if (err === null) props.closeself();
        if (!err) { //success
            props.noErrors && props.noErrors()
            return <div><h6>{t("pop_up.succes_add_user")}</h6></div>
        }
        if (typeof err === "string") {
            return err
        }
        return defErr;
    }


    const handleClose = () => {
        !err ? props.closeFather() : props.closeSelf();
    }



    return (
        <div id="newUserPopupMessage" className="admin_popups">
            <div>
                {createMsg() || defErr}
            </div>
            <div className="cancelAdminForm" onClick={handleClose} >{t("close")}</div>
        </div>
    );
}

export default inject("UsersStore")(observer(AdminNewUserMessagePopup));