import React from 'react';


const AdminSettingOption = ({ title = "", onClick = undefined, text = "", buttonText = "", htmlFor = undefined }) => {
    return (
        <div className="setting-container">
            <div className="setting-title">{title}</div>
            {/* <div className="setting-text">{text}</div> */}
            {text.length ? <div className="setting-text">{text}</div> : null}
            {typeof htmlFor === "string"
                ? <label htmlFor={htmlFor} onClick={onClick} className="setting-button">{buttonText}</label>
                : <button onClick={onClick} className="setting-button" >{buttonText}</button>}
        </div>
    );
}

export default AdminSettingOption;