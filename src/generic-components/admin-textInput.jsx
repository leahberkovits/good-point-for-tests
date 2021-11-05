import React, { useMemo, useRef } from 'react';

export const AdminTextInput = ({ error, helperText, value = "", defaultValue, onChange, onBlur, label, disabled, underText, type = "text", dir = "rtl", underTextId = "", underTextClass = "", inputId = undefined }) => {

    const showDefaultVal = useRef(true);

    const valuee = useMemo(() => { // input tag must have something in either the defaultValue-prop or the value-prop. not in eny and not in both. this is the way I found so defaultValue works
        if (defaultValue && showDefaultVal.current) {
            showDefaultVal.current = false;
            return defaultValue // * defaultValue
        }
        return value; //* value
    }, [value, defaultValue]); // defaultValue is not supposed to change, React asked to add it to the dependency arr

    return (
        <div className="admin-text-input-container">
            <div className="admin-text-input-label">{label || ""}</div>
            <input value={valuee || ""} onChange={onChange} onBlur={onBlur || undefined} className={`admin-text-input-input ${error ? "admin-text-input-input--error" : ""}`} disabled={disabled || false} type={type} dir={dir} id={inputId} />
            <div className="admin-text-input-helperText">{helperText || " "}</div>
            <div id={underTextId} className={`admin-text-input-underText ${underTextClass}`} >{underText || ""}</div>
        </div>
    );
}