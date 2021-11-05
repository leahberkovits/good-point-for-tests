import React, { createElement, useMemo, useRef, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import Auth from '../modules/auth/Auth';

import GenderOptionsLowerCased, { convertStudentGenderToEng as convertTeacherGenderToEng, convertStudentGenderToHeb as convertTeacherGenderToHeb } from '../consts/GenderOptionsLowerCased';

import { regexes } from '../consts/consts';
import { useTranslate } from '../translation/GPi18n';

import { AdminTextInput } from '../generic-components/admin-textInput';
import { AdminDD } from '../generic-components/admin-dropdown';
import ErrorPopup from './error_popup';

let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms

let emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/; // should really be in consts.js or something

let dataErrCnt = 0;
let nameErrCnt = 0;
const AdminTeacherEditPopup = ({ teacher, index, openPopups, closePopups, UsersStore }) => {
    const { t } = useTranslate();

    let submitting = useRef(false).current;
    var closeEditTO = useRef(null).current;

    const [vals, setVals] = React.useState({ teacherFirstName: teacher.teacherFirstName, teacherLastName: teacher.teacherLastName, teacherGender: { value: teacher?.teacherGender.toUpperCase(), name: t("genders." + teacher.teacherGender.toLowerCase()) }, email: teacher?.email });
    const [errs, setErrs] = React.useState({});
    const [helperText, setHelperText] = React.useState([]);
    const [errMSg, setErrMsg] = React.useState(null);

    const [openGenderDD, setOpenGenderDD] = React.useState(null); // gender drop down
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time

    const [localPopups, setLocalPopups] = React.useState();
    const isFemale = useMemo(() => (typeof teacher.teacherGender === "string" && teacher.teacherGender.toLowerCase() === GenderOptionsLowerCased.FEMALE), [teacher.teacherGender])
    const getGenders = useMemo(() => ['', t("genders.male"), t("genders.female"), t("genders.other")].map(gender => (typeof convertTeacherGenderToEng[gender] === "string" ? { key: "k" + gender, value: convertTeacherGenderToEng[gender].toUpperCase(), name: gender } : { key: "k" + gender })), []) // should happen once, cos should never change
    const haveLocaPopupsToRender = useMemo(() => localPopups && typeof localPopups === "object" && localPopups.c && localPopups.props, [localPopups]);
    useEffect(() => {
        return () => {
            clearTimeout(closeEditTO); // todo bug: can't clear the closeEditTO!!! to reproduce: update a teacher -> click הבנתי on the success message. if you open, fast enough, another teacher to edit, it will close after like less than a second
            clearTimeout(ddTO);
        }
    }, []);

    const setErrOnField = (field, msg = false, removeErr = false) => {
        setErrs(errsT => ({ ...errsT, [field]: removeErr ? false : true }));
        if (typeof msg === "string") {
            setHelperText(helperTextT => ({ ...helperTextT, [field]: msg }))
        }
    }

    const handleChange = (e, field) => {
        setErrOnField(field, '', true);
        let fieldValue = e && e.value ? e : e.target?.value; // if field is teacherGender, e is the item from AdminDD and not an event
        setVals(v => ({ ...v, [field]: fieldValue }));
        setErrs([]);
        setErrMsg(null);
    }


    const validateName = (nameVal, nameName, hebName) => {
        if (nameVal.length < 2) {
            setErrOnField(nameName, t("validation.name_min_length"));
            nameErrCnt++;
            return false;
        }
        else if (nameVal.length > 20) {
            setErrOnField(nameName, t("validation.name_max_length"));
            nameErrCnt++;
            return false;
        }
        else {
            let res = regexes.FIRST_LAST_NAME.test(nameVal);
            if (!res) {
                setErrOnField(nameName, nameErrCnt > 2
                    ? `${hebName || ""} ${t("validation.must_for_name")}`
                    : t("only_letters"));
                nameErrCnt++;
                return false;
            }
        }
        return true;
    }

    const handleBlur = (field) => {
        setErrMsg(null);
        setErrOnField(field, '', true);
    }
    const handleDDBlur = () => {
        if (!openGenderDD) return;
        clearTimeout(ddTO);
        setOpenGenderDD(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleDDClick = () => {
        clearTimeout(ddTO);
        setOpenGenderDD(v => !v);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleSubmit = async finalFormValues => {
        if (submitting) return;
        submitting = true;
        setErrMsg(null);

        if (typeof finalFormValues.teacherFirstName === "string" && finalFormValues.teacherFirstName.length) finalFormValues.teacherFirstName = vals.teacherFirstName.trim();
        if (typeof finalFormValues.teacherLastName === "string" && finalFormValues.teacherLastName.length) finalFormValues.teacherLastName = vals.teacherLastName.trim();
        if (typeof finalFormValues.email === "string" && finalFormValues.email.length) finalFormValues.email = vals.email.trim();

        if (!finalFormValues.teacherFirstName || !finalFormValues.teacherFirstName.length) { //validate teacher first name
            setErrOnField("teacherFirstName", t("validation.first_name_must"))
            submitting = false;
            return;
        }
        if (!finalFormValues.teacherLastName || !finalFormValues.teacherLastName.length) { // validate teacher last name
            setErrOnField("teacherLastName", t("validation.last_name_must"))
            submitting = false;
            return;
        }

        if (!validateName(finalFormValues.teacherFirstName, "teacherFirstName", `${isFemale ? t("admin.students.her_name") : t("admin.students.his_name")} ${t("admin.teachers.first_name_of_teacher")}`)) { // validate teacher first name
            submitting = false;
            return;
        }
        if (!validateName(finalFormValues.teacherLastName, "teacherLastName", t("admin.teachers.last_name_of_teacher"))) { // validate teacher last name
            submitting = false;
            return;
        }
        if (!finalFormValues.email || !finalFormValues.email.length) {
            setErrOnField("email", t("validation.enter_mail"));
            submitting = false;
            return;
        }
        if (!emailRE.test(finalFormValues.email)) {
            setErrOnField('email', t("validation.wrong_mail"));
            submitting = false;
            return;
        }
        if (!finalFormValues.teacherGender || !finalFormValues.teacherGender.value || !regexes.GENDER.test(finalFormValues.teacherGender.value)) {
            setErrOnField("teacherGender");
            submitting = false;
            return;
        }

        if (teacher.teacherFirstName === finalFormValues.teacherFirstName && teacher.teacherLastName === finalFormValues.teacherLastName && finalFormValues.email === teacher.emil) {
            // no values have been changed:
            closePopups();
            return;
        }

        let [res, err] = await Auth.superAuthFetch('/api/CustomUsers/updateTeacher', {
            method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prevTFirst: teacher.teacherFirstName,
                prevTLast: teacher.teacherLastName,
                tFirst: finalFormValues.teacherFirstName,
                tLast: finalFormValues.teacherLastName,
                tGender: finalFormValues.teacherGender.value,
                tEmail: finalFormValues.email
            })
        });
        submitting = false;

        if (err || !res) {
            // error
            setLocalPopups({ // and not openPopups, bcos openPopups will close the teacher edit popup
                c: ErrorPopup,
                props: {
                    text: err === "NO_INTERNET" ? t("alerts.no_internet_on_action") : t("alerts.internal_error"),
                    okayText: t("got_it"),
                    openPopups: setLocalPopups
                }
            });
            return;
        }
        else if (res === "DATA_ERROR") {
            // data error
            nameErrCnt++;
            const dataErrMsg = dataErrCnt > 2 ? `${t("validation.part_invalid")}, ${isFemale ? t("admin.students.her_name") : t("admin.students.his_name")} ${t("validation.teacher_last_and_first")}` : t("validation.part_invalid");
            setLocalPopups({ // and not openPopups, bcos openPopups will close the teacher edit popup
                c: ErrorPopup,
                props: {
                    text: dataErrMsg,
                    okayText: t("close"),
                    openPopups: setLocalPopups
                }
            });
            return;
            // openPopups(dataErrMsg, "ERROR", [null, null, null], true);
        }
        else {
            //success
            UsersStore.updateAdminTeachersList(index, finalFormValues.teacherFirstName, finalFormValues.teacherLastName, finalFormValues.teacherGender.value);
            openPopups({ popup: "ERROR", text: t("pop_up.succes_teacher_update") });
            closeEditTO = setTimeout(closePopups, 2000);
            return;
        }

    }

    return (
        <div className="admin_popups admin-new-instance-signup-container" id="teachers_edit_popup">
            <h6 className="new-instance-title new-teacher-title">{`${t("admin.teachers.edit_the")} ${teacher.teacherFirstName} ${teacher.teacherLastName}`}</h6>

            <div className="admin-new-instance-form-container">
                <AdminTextInput label={`${t("signup.first_name")}:`} value={vals['teacherFirstName'] || ""} /* defaultValue={teacher.teacherFirstName} */ error={errs['teacherFirstName']} helperText={helperText['teacherFirstName']} onChange={(e) => { handleChange(e, 'teacherFirstName') }} onBlur={() => { handleBlur('teacherFirstName') }} />
                <AdminTextInput label={`${t("signup.last_name")}:`} value={vals['teacherLastName'] || ""} /* defaultValue={teacher.teacherLastName} */ error={errs['teacherLastName']} helperText={helperText['teacherLastName']} onChange={(e) => { handleChange(e, 'teacherLastName') }} onBlur={() => { handleBlur('teacherLastName') }} />
            </div>

            <div className="admin-new-instance-form-container">
                <AdminTextInput label={`${t("email")}:`} value={vals['email'] || ""} /* defaultValue={teacher.email} */ error={errs['email']} helperText={helperText['email']} dir="ltr" /* < email is in english */ inputId="teachers_edit_popup-email-input" onChange={(e) => { handleChange(e, 'email') }} onBlur={() => { handleBlur('email') }} />
            </div>

            <div className="admin-new-instance-form-container admin-new-instance-input">
                <div>{t("gender")}:</div>
                <AdminDD
                    showDDItems={openGenderDD}
                    handleDDBlur={handleDDBlur}
                    handleDDClick={handleDDClick}
                    ddItems={getGenders}
                    selectedItem={vals["teacherGender"]}
                    isError={errs['teacherGender'] || null}
                    handleItemclick={(e) => { handleChange(e, 'teacherGender') }}
                    arrowAnimation={arrowAnimation}
                    className="admin-new-instance-dropdown"
                    itemsContainerClassName="admin-new-instance-dropdown-items"
                />
            </div>

            <div className="new-instance-buttons-container" >
                <button className="cancelAdminForm" onClick={closePopups}> {t("cancel")} </button>
                <button className="saveAdminForm" onClick={() => { handleSubmit(vals) }}> {t("save")} </button>
            </div>

            <div id="teacher-edit-error-msg" >{typeof errMSg === "string" ? errMSg : ""}</div>

            {haveLocaPopupsToRender ? createElement(localPopups.c, localPopups.props) : null}
        </div>
    );
}

export default inject("UsersStore")(observer(AdminTeacherEditPopup));
