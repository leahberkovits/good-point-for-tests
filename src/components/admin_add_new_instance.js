import React, { useMemo } from 'react';
import { inject, observer } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useTranslate } from '../translation/GPi18n';
import { useOpenPopups } from '../contexts/openPopupsContext';

import xlsxParser from 'xlsx-parse-json';

// import ClassesUtils from './ClassesUtils';
import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased';

import AdminNewClassInstance from './admin_new_class_instance';
import { AdminFileUploadPopup } from './modals/admin_file_upload_popup';
import { AdminExcelUploadInfoPopup } from './modals/admin_excel_upload_info_popup';
import { useConsts } from '../contexts/constsContext';

const AdminAddNewInstance = ({ currTable, StudentsStore, UsersStore }) => {
    const consts = useConsts();
    const { t } = useTranslate();
    const { openPopups } = useOpenPopups()

    const fileInput = React.useRef();

    const handleClassesPostSuccess = (success, classes, downloadTemplate = false) => {
        clearFileUpload()
        let msg;
        // if (success !== null && success) { //success
        //     // let currFile = { ...selectedFiles };
        //     // currFile[currTable] = null;
        //     // setSelectedFiles(currFile);
        // }
        //error 
        if (typeof classes === "string") {
            openPopups({ info: [classes, ''], popup: 'NEW_INSTANCE_POPUP', downloadTemplate, removePopupOnOutsideClick: true });
            return;
        }
        const topMsg = classes ? classes.msg || '' : ""
        if (classes && classes.existingClasses && Array.isArray(classes.existingClasses) && classes.existingClasses.length) {
            const words = classes.existingClasses.length > 1 ? [t("admin.classes.the_classes"), t("admin.students.not_added"), t("admin.classes.exists")] : [t("admin.classes.the_classes"), t("admin.students.not_added_F"), t("admin.students.exists_F")]
            msg = `${words[0]} ${classes.existingClasses.map(ec => consts.GET_HEBREW_GRADES[ec.grade - 1] || ec.grade + " " + ec.classIndex).join(', ')} ${words[1]} ${t("admin.students.because")}${words[2]}`
        }
        openPopups({ info: [msg, topMsg], popup: 'NEW_INSTANCE_POPUP', downloadTemplate, removePopupOnOutsideClick: true }); //3rd is download template option
    }

    const handleTeachersPostSuccess = ([postErr, postRes, teachers]) => {
        if (postErr || !postRes) {
            openPopups(t("pop_up.error.uploading_teachers"), 'ERROR', [t("close"), false, null])
            return;
        }
        if (postRes.error) {
            let msg = t("alerts.something_wrong_in_file");
            if (postRes.teacher) {
                let addedTeacherName = false;
                msg += t("for_teacher");
                if (typeof postRes.teacher.firstName === "string" && postRes.teacher.firstName.length) {
                    addedTeacherName = true;
                    msg += " " + postRes.teacher.firstName;
                }
                if (typeof postRes.teacher.lastName === "string" && postRes.teacher.lastName.length) {
                    addedTeacherName = true;
                    msg += " " + postRes.teacher.lastName;
                }
                if (!addedTeacherName) msg = t("alerts.not_valid_teacher");
                else msg += "."
            }
            msg += "\n";

            if (typeof postRes.errorField === "string") {
                const toHeb = consts.NEW_USER_KEYS_TO_HEB[postRes.errorField]
                msg += toHeb || postRes.errorField;
            }
            if (typeof postRes.errorMessage === "string") msg += " " + postRes.errorMessage
            // openPopups(msg, 'ERROR', ["סגור", false, null]); // -->
            openPopups({ text: msg, popup: 'ERROR', okayText: t("close"), cancelText: false });
            return;
        }
        UsersStore.addToAdminTeachersList(teachers.map(t => ({ ...t, teacherFirstName: t.firstName, teacherLastName: t.lastName, teacherGender: t.gender })))
        openPopups({ text: t("alerts.teachers_scc"), popup: 'ERROR', okayText: t("close"), cancelText: false });
    }

    const handleStudentsPostSuccess = (success, students, downloadTemplate = false) => {
        // this is the cb that postStudents() calls when done (postStudents in students store)
        let msg = "";
        let topMsg = "";
        clearFileUpload()
        // if (success !== null && success) { //success
        // let currFile = { ...selectedFiles };
        // currFile[currTable] = null;
        // setSelectedFiles(currFile); //popup at the end for all cases except for need home teacher
        // }
        //error 
        if (typeof students === "string") {
            msg = students
            openPopups({ info: [msg, ''], popup: 'NEW_INSTANCE_POPUP', downloadTemplate, removePopupOnOutsideClick: true });
            return;
        }

        if (students.createdStudents && Array.isArray(students.createdStudents) && students.createdStudents.length)
            topMsg += `${students.createdStudents.length > 1 ? t("admin.students.added") : (students.createdStudents[0].gender.toLowerCase() === GenderOptionsLowerCased.FEMALE ? t("admin.students.added_F") : t("admin.students.added_M"))}` //stuednts were added successfully
        if (students.existing && Array.isArray(students.existing) && students.existing.length) {
            const existingWords = students.existing.length > 1 ? [t("the_students"), t("admin.students.not_added"), t("admin.students.exists")] : (students.existing[0].gender.toLowerCase() === GenderOptionsLowerCased.FEMALE ? [t("opennings_msg.the_student_F"), t("admin.students.not_added_F"), t("admin.students.exists_F")] : [t("opennings_msg.the_student_M"), t("admin.students.not_added_M"), t("admin.students.exists_M")])
            msg += `${existingWords[0]} ${students.existing.map(s => s.name).join(', ')} ${existingWords[1]} ${t("admin.students.because")}${existingWords[2]}`
        }
        if (students.createdClasses && Array.isArray(students.createdClasses) && students.createdClasses.length) {
            // need home teacher
            openPopups({ info: msg, popup: 'NEED_HOME_TEACHER', moreInfo: [topMsg, students.createdClasses, students.teachersList] })
        }
        else openPopups({ info: [msg, topMsg], popup: 'NEW_INSTANCE_POPUP', downloadTemplate, removePopupOnOutsideClick: true });
    }


    const clearFileUpload = () => {
        try {
            fileInput.current.value = '';
        }
        catch (err) { }
    }

    const handleFileSelected = async (e) => {
        const file = e.target.files[0]
        openPopups({
            removePopupOnOutsideClick: true, comp: AdminFileUploadPopup,
            compProps: {
                fileName: file.name, onClick: (procceedToFileRead) => {
                    if (procceedToFileRead) {
                        handleFileRead(file)
                    }
                }
            }
        })
    }


    const handleFileRead = (file) => {
        openPopups({ info: t("pop_up.file_loading"), popup: 'ERROR' })
        xlsxParser.onFileSelection(file).then(data => { // await ?
            (async () => {
                openPopups({ popup: 'LOADING' });
                const allSheets = [];
                for (let sheetI in data) {//takes all sheets from excel/csv 
                    if (data[sheetI].length > 100000) {
                        openPopups({ info: `${t("file_too_big")}, ${t("its_length")} ${data[sheetI].length} ${t("excel_lines")}`, popup: 'ERROR', removePopupOnOutsideClick: true })
                        return;
                    }
                    allSheets.push(...data[sheetI])  //take all sheets from excel/csv 
                }
                if (currTable === consts.ADMIN_STUDENTS_TABLE)
                    await StudentsStore.adminAddStudentsExcel(allSheets, handleStudentsPostSuccess);
                else if (currTable === consts.ADMIN_CLASSES_TABLE)
                    await StudentsStore.adminAddClassesExcel(allSheets, handleClassesPostSuccess);
                else if (currTable === consts.ADMIN_TEACHERS_TABLE) {
                    let res = await UsersStore.adminAddMultTeachers(allSheets, consts.NEW_USER_KEYS_HEB, consts.NEW_USER_KEYS_TO_ENG)
                    handleTeachersPostSuccess(res);
                }
            })();
        });
    }

    const handleFileUploadClick = (e) => {
        clearFileUpload()
    }

    const handleSignUpByForm = () => {
        // form popups:
        if (currTable === consts.ADMIN_STUDENTS_TABLE)
            openPopups({ popup: 'NEW_STUDENT_INSTANCE', handleStudentsPostSuccess: handleStudentsPostSuccess })
        else if (currTable === consts.ADMIN_CLASSES_TABLE) {
            openPopups({ popup: 'NEW_CLASS_INSTANCE', comp: AdminNewClassInstance, compProps: { handleClassesPostSuccess } });
        }
        else if (currTable === consts.ADMIN_TEACHERS_TABLE)
            openPopups({ popup: 'NEW_TEACHER_SIGNUP', removePopupOnOutsideClick: true })
    }

    const handleInfo = () => {
        openPopups({ comp: AdminExcelUploadInfoPopup, compProps: { currTable: currTable } })
    }

    const getUploadFormText = () => {
        switch (currTable) {
            case consts.ADMIN_STUDENTS_TABLE:
                return [t("admin.students.add_student"), t("admin.students.add_excel")];
            case consts.ADMIN_CLASSES_TABLE:
                return [t("admin.classes.add"), t("admin.classes.add_excel")];
            case consts.ADMIN_TEACHERS_TABLE:
                return [t("admin.teachers.add_new"), t("admin.teachers.add_excel")];
            default:
                return ["", ""];
        }
    }
    const [uploadFormText, uploadTitle] = useMemo(getUploadFormText, [currTable])

    return (
        <>
            <label htmlFor="excel-button-upload" className="upload-ways" id="file-upload-label" title={uploadTitle}>
                <input
                    accept=".csv, .xlsx, .xls application/vnd.oasis.opendocument.spreadsheet application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    id="excel-button-upload"
                    className={'admin-excel-uploader-input'}
                    type="file"
                    onChange={handleFileSelected}
                    ref={fileInput}
                />
                <div id="file-upload-text" onClick={handleFileUploadClick}>{t("admin.upload_excel")}</div>
            </label>
            <div id="upload-way-form" onClick={handleSignUpByForm} className="upload-ways" >
                <FontAwesomeIcon id="upload-way-form-icon" icon="plus-circle" />
                <div id="upload-way-form-text"> {uploadFormText}</div>
            </div>
            <button title={`${t("admin.info_about_excel")} ${uploadTitle}`} id="upload-way-info" onClick={handleInfo} >
                <FontAwesomeIcon icon="info" />
            </button>
        </>
    );
}

export default inject("GoodPointsStore", "StudentsStore", "UsersStore")(observer(AdminAddNewInstance));