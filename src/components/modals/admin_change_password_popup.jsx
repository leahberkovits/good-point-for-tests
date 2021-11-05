import React, { useMemo, useState } from 'react';
import { inject, observer } from 'mobx-react'

import { regexes } from '../../consts/consts';
import { AdminTextInput } from '../../generic-components/admin-textInput';

import './admin_change_password_popup.scss';
import { useTranslate } from '../../translation/GPi18n';

const Fields = { OLD_PASS: 'OLD_PASS', NEW_PASS_1: "NEW_PASS_1", NEW_PASS_2: "NEW_PASS_2", GENERAL: "GENERAL" };  // must match the const fields remote method!!!!
const AdminChangePasswordPopup = inject("UsersStore")(observer(({ openPopups, closePopups, UsersStore }) => {
    const { t } = useTranslate();
    const DiffThanOldPW_Msg = t("errors.reset_p.diff_p");
    const PWLongetThan8_Msg = t("errors.reset_p.valid_p");
    const [vals, setVals] = useState({});
    const [errs, setErrs] = useState({});

    const setErrOnField = (field, error = true) => {
        setErrs(_e => ({ [field]: error })); // _e (not using e) cos usually has one err at a time...
    }

    const handleEndOfPW1Write = (vals) => { // pw 1 blur
        if (!vals[Fields.NEW_PASS_1] || !vals[Fields.NEW_PASS_1].length) {
            return;
        }
        if (vals[Fields.NEW_PASS_1].length < 8) {
            setErrOnField(Fields.NEW_PASS_1, PWLongetThan8_Msg)
            return
        }
        //check if oldPass === newPass1
        if (vals[Fields.OLD_PASS] === vals[Fields.NEW_PASS_1]) {
            setErrOnField(Fields.NEW_PASS_1, DiffThanOldPW_Msg)
            return;
        }
        if (!regexes.PASSWORD.test(vals[Fields.NEW_PASS_1])) { // check whether new pw is valid
            setErrOnField(Fields.NEW_PASS_1, t("errors.reset_p.valid_p"));
            return;
        }
        setErrOnField(Fields.NEW_PASS_1, false);
    }

    const handleSubmit = (vals) => {
        setErrs({});
        if (!vals[Fields.OLD_PASS] || !vals[Fields.OLD_PASS].length) {
            setErrOnField(Fields.OLD_PASS);
            return;
        }
        if (!vals[Fields.NEW_PASS_1] || !vals[Fields.NEW_PASS_1].length) {
            setErrOnField(Fields.NEW_PASS_1)
            return;
        }
        if (!vals[Fields.NEW_PASS_2] || !vals[Fields.NEW_PASS_2].length) {
            setErrOnField(Fields.NEW_PASS_2)
            return;
        }
        //all fields are NOT empty-- have value 
        //check if OLD_PW === NEW_PW_1
        if (vals[Fields.OLD_PASS] === vals[Fields.NEW_PASS_1]) {
            setErrOnField(Fields.NEW_PASS_1, DiffThanOldPW_Msg)
            return;
        }
        //check if wanted-newPass is valid
        if (!regexes.PASSWORD.test(vals[Fields.NEW_PASS_1])) { // if not valid
            setErrOnField(Fields.NEW_PASS_1, t("errors.reset_p.valid_p"))
            return;
        }
        //check if NEW_PW_1 is the same as NEW_PW_2
        if (vals[Fields.NEW_PASS_1] !== vals[Fields.NEW_PASS_2]) {
            setErrOnField(Fields.NEW_PASS_2, t("errors.reset_p.no_match"))
            return;
        }

        //all good - let's change it
        UsersStore.resetPW(vals[Fields.OLD_PASS], vals[Fields.NEW_PASS_1], err => {
            if (!err) {
                openPopups({ popup: "ERROR", text: t("login.change_succ"), okayText: t("close"), removePopupOnOutsideClick: true });
                return;
            }
            if (err.error && err.error.message) {
                const errSplit = err.error.message.split(';')
                if (errSplit && errSplit.length && Object.values(Fields).includes(errSplit[0])) {
                    if (errSplit.length === 2)
                        setErrOnField(errSplit[0], errSplit[1])
                    else
                        setErrOnField(errSplit[0])
                    return;
                }
            }
            setErrOnField(Fields.GENERAL, t("admin.error_try_again"))
        })
    }


    const handleChange = field => event => {
        event.persist();
        // debugger;
        setVals(v => ({ ...v, [field]: event.target.value }));
    }

    const errMessage = useMemo(() => errs && errs[Fields.GENERAL], [errs]);


    // todo check on big screen
    return (
        <div className="admin_popups admin-new-instance-signup-container" id="admin-change-pw-popup">
            <h6 className="new-instance-title admin-change-pw-title">{t("login.change_p")}</h6> {/* with curly braces YEAH i know */}

            <div className="admin-new-instance-form-container admin-new-instance-input">
                <AdminTextInput
                    label={t("login.current_p")}
                    value={vals[Fields.OLD_PASS] || ""}
                    error={errs[Fields.OLD_PASS]}
                    helperText={errs[Fields.OLD_PASS]}
                    onChange={handleChange(Fields.OLD_PASS)}
                />
            </div>
            <div className="admin-new-instance-form-container admin-new-instance-input">
                <AdminTextInput
                    label={t("login.new_p")}
                    value={vals[Fields.NEW_PASS_1] || ""}
                    error={errs[Fields.NEW_PASS_1]}
                    helperText={errs[Fields.NEW_PASS_1]}
                    onChange={handleChange(Fields.NEW_PASS_1)} onBlur={() => handleEndOfPW1Write(vals)}
                />
            </div>
            <div className="admin-new-instance-form-container admin-new-instance-input">
                <AdminTextInput
                    label={t("sign_up.psw_verify")}
                    value={vals[Fields.NEW_PASS_2] || ""}
                    error={errs[Fields.NEW_PASS_2]}
                    helperText={errs[Fields.NEW_PASS_2]}
                    onChange={handleChange(Fields.NEW_PASS_2)}
                />
            </div>

            <div className="admin-new-instance-form-container admin-new-instance-input admin-new-instance-errMessage">{errMessage}</div>

            <div className="new-instance-buttons-container" >
                <button className="cancelAdminForm" onClick={closePopups}> {t("cancel")} </button>
                <button className="saveAdminForm" onClick={() => { handleSubmit(vals) }}> {t("end")} </button>
            </div>

        </div>
    )
}))
export { AdminChangePasswordPopup };