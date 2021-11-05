import React from 'react'
import { useTranslate } from '../translation/GPi18n';

import './client_teacher_general_alerts.scss'


export const GeneralAlert = ({ text, warning, block, isPopup, noTimeout = false }) => {
    if (isPopup) return <GeneralPopup text={text} block={block} {...isPopup} />

    return (
        <div id="general-alert-container" className={`${warning ? "warning-color" : "default-color"} ${block ? "block" : ""} ${noTimeout ? "" : "timeout-animation"}`} >
            {text}
        </div>
    );
}

export const GeneralPopup = ({ text, okayText, cancelText, closeSelf, popupCb: cb }) => {
    const { t } = useTranslate();

    return (
        <div className="popup-alert-full-window" >
            <div className="popup-alert-container">
                <h3 id="popup-text" >{text}</h3>
                <div className="popup-buttons-container" >
                    {cancelText ? <button onClick={() => { cb && typeof cb === "function" && cb(false); closeSelf() }} className="popup-cancel" ><h4>{cancelText || t("cancel")}</h4></button> : null}
                    <button onClick={() => { cb && typeof cb === "function" && cb(true); closeSelf() }} className="popup-okay" ><h4>{okayText || t("pop_up.approve")}</h4></button>
                </div>
            </div>
        </div>
    )
}