import React from 'react';
import { useTranslate } from '../translation/GPi18n';

import consts from '../consts/consts'

import './CSS/error_popup.scss'
import { useConsts } from '../contexts/constsContext';


const AdminNewInstancePopup = ({ cancelText, okayText, downloadTemplate, topText, text, handlePopupClick, openPopups }) => {
    const { t } = useTranslate();
    const { EXCEL_TEMPLATE_STUDENTS_NAME,
        EXCEL_TEMPLATE_CLASSES_NAME } = useConsts();
    const handleCancelClick = () => {
        if (typeof handlePopupClick === "function") {
            handlePopupClick(false);
        }
        if (typeof openPopups === "function") {
            openPopups(null, null);
        }
    }

    const handleOkayClick = () => {
        if (typeof openPopups === "function") {
            openPopups(null, null);
        }
        if (typeof handlePopupClick === "function") {
            handlePopupClick(true);
        }
    }
    return (
        <div className="admin_popups" id="new-instance-popup" >
            {topText ? <h3 id="error-msg" ><p id="error-text">{topText}</p></h3> : null}
            <h6 id="error-msg" ><div id="error-text">{text}</div></h6>

            {!downloadTemplate ? null :
                <div id="downloadTemplate">
                    {t("admin.download_exmaple")} {' '}
                    <a href={downloadTemplate === "STUDENTS" ? EXCEL_TEMPLATE_STUDENTS_NAME : downloadTemplate === "CLASSES" ? EXCEL_TEMPLATE_CLASSES_NAME : null} download id="download-here" >
                        {t("here")}
                    </a>
                </div>
            }

            <div id="buttons-container">
                {okayText !== false
                    ? <div id="okay-button" className="saveAdminForm" onClick={handleOkayClick} >{okayText ? okayText : t("got_it")}</div>
                    : null}
                {cancelText && handlePopupClick
                    ? <div id="cancel-button" className="cancelAdminForm" onClick={handleCancelClick} >{cancelText}</div>
                    : null}
            </div>
        </div>
    );
}

export default AdminNewInstancePopup;