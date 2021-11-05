import React from 'react'
import { useTranslate } from '../../translation/GPi18n'

import './general_popup.scss'


const GeneralPopup = ({ text, okayText, cancelText, closeSelf, popupCb: cb }) => {
const {t}=useTranslate();
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

export default GeneralPopup;
