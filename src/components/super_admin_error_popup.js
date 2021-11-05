import React from 'react';

import './CSS/super_admin_error_popup.scss'
import { Button } from '@material-ui/core';
import { useTranslate } from "../translation/GPi18n";

const SuperAdminErrorPopup = (props) => {
    const t = useTranslate();

    return (
        <div className="admin_popups" id="error-popup" >

            <h6 id="error-msg" >{props.text}</h6>
            <div id="buttons-container">
                {props.cancelText && props.handlePopupClick &&
                    <Button className="cancelAdminForm" id="cancel-button" onClick={() => { if (props.handlePopupClick) { props.handlePopupClick(false) } props.openPopups(null, null) }} >{props.cancelText}
                    </Button>}
                <Button className="saveAdminForm" id="okay-button" onClick={() => { props.openPopups(null, null); if (props.handlePopupClick) { props.handlePopupClick(true) } }} >
                    {props.okayText ? props.okayText : t("got_it")}
                </Button>
            </div>

        </div>
    );
}

export default SuperAdminErrorPopup;