import React from 'react';
import { useTranslate } from "../translation/GPi18n";

import './CSS/error_popup.scss'


// topText was commented out from render cos has the same id as the div under it, and no one seemed to use it
const ErrorPopup = ({ text, topText, okayText, cancelText, handlePopupClick, openPopups }) => {
    const { t } = useTranslate();

    // topText no in use
    const handleOkayClick = () => {
        if (typeof openPopups === "function") {
            openPopups(null, null)
        };
        if (typeof handlePopupClick === "function") {
            handlePopupClick(true)
        }
    }
    const handleCancelClick = () => {
        if (typeof handlePopupClick === "function") {
            handlePopupClick(false)
        };
        if (typeof openPopups === "function") {
            openPopups(null, null)
        }
    }

    return (
        <div className="admin_popups" id="error-popup" >
            {/* {topText ? <h3 id="error-msg" ><p id="error-text">{topText}</p></h3> : null} !DOESN'T SEEM LIKE THIS IS IN USE. PLUS, IT HAS THE SAME IDs AS THE THE LINE BELOW HAS*/}
            <div id="error-msg" ><p id="error-text">{text}</p></div>
            <div id="buttons-container">
                {okayText !== false
                    ? <div className="saveAdminForm" id="okay-button" onClick={handleOkayClick} >{okayText ? okayText : t("got_it")}</div> : null}
                {cancelText && handlePopupClick
                    ? <div className="cancelAdminForm" id="cancel-button" onClick={handleCancelClick} >{cancelText}</div>
                    : null}
            </div>
        </div>
    );
}
export default ErrorPopup;