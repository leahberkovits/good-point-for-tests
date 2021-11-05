
import React from 'react';
import { inject, observer } from 'mobx-react'
import { useTranslate } from "../translation/GPi18n";
import { Button } from '@material-ui/core';


import './CSS/super_admin_new_admin_popup.scss'




const SuperAdminNewAdminPopup = (props) => {
    const {t} = useTranslate()
    const defErr = t("alerts.internal_error");
    const { err } = props;

    const createMsg = () => {
        if (err === null) props.closeself();
        if (!err) { //success
            props.noErrors()
            return t("pop_up.succes_add_admin")
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
            <Button variant="outlined" onClick={handleClose} >{t("close")}</Button>
        </div>
    );
}

export default inject("UsersStore")(observer(SuperAdminNewAdminPopup));