import React from 'react'

import './admin_general_alerts.scss'

//! made changes, for good point admin
//! לא בשימוש
export const GeneralAlert = ({ text, warning, center, isPopup, noTimeout = false }) => {
    if (typeof text !== "string") { return null; }
    // if (isPopup) return <GeneralPopup text={text} {...isPopup} /> //not suppored, style doesn't match, (could use openPopus instead)

    return (
        <div id="general-alert-container" className={`${warning ? "warning-color" : "default-color"} ${center ? "center" : ""} ${noTimeout ? "" : "timeout-animation"}`} >
            {text}
        </div>
    );
}

// export const GeneralPopup = ({ text, okayText, cancelText, closeSelf, popupCb: cb }) => {

//     return (
//         <div id="popup-alert-full-window" >
//             <div className="popup-alert-container admin_popups">
//                 <h3 id="popup-text" >{text}</h3>
//                 <div className="new-instance-buttons-container" >
//                     {cancelText ? <div onClick={() => { cb && typeof cb === "function" && cb(false); closeSelf() }} className="cancelAdminForm" ><div>{cancelText || "בטל"}</div></div> : null}
//                     <div onClick={() => { cb && typeof cb === "function" && cb(true); closeSelf() }} className="saveAdminForm" ><div>{okayText || "אשר"}</div></div>
//                 </div>
//             </div>
//         </div>
//     )
// }
