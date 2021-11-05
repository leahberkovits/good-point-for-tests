import React from 'react';
import { inject, observer } from 'mobx-react'

import Auth from '../modules/auth/Auth';
import GenericTools from '../modules/tools/GenericTools';
import { useOpenPopups } from '../contexts/openPopupsContext';

import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased';

import { AdminChangePasswordPopup } from './modals/admin_change_password_popup';
import { RenderAdminSettingsOptions } from './render_admin_settings_options'

import xlsxParser from 'xlsx-parse-json';

import './CSS/admin_settings.scss';
import { useTranslate } from '../translation/GPi18n';
import { useConsts } from '../contexts/constsContext';


const AdminSettings = (props) => {
    const { t } = useTranslate();
    const { NEW_USER_KEYS_HEB, NEW_USER_KEYS_TO_ENG, NEW_USER_KEYS_TO_HEB } = useConsts();

    const { openPopups } = useOpenPopups(); // closePopups

    const isFemale = props.UsersStore.fullName && typeof props.UsersStore.fullName.gender === "string" && props.UsersStore.fullName.gender.toLowerCase() === GenderOptionsLowerCased.FEMALE

    const handleLogout = async () => { await Auth.logout(); props.history.push("/") }

    const handleResetGPsClick = () => {
        openPopups({
            popup: 'ERROR',
            text: `${t("pop_up.if")} ${isFemale ? t("pop_up.sure_female") : t("pop_up.sure_male")} ${t("pop_up.zero_points")} ${isFemale ? t("pop_up.notice_female") : t("pop_up.notice_male")}, ${t("pop_up.irreversable_action")}`,
            okayText: t("superadmin.clean.yes_clean"),
            cancelText: t("superadmin.clean.no_cancel"),
            removePopupOnOutsideClick: true,
            handlePopupClick: (res) => {
                if (!res) { // cancel
                    return;
                }
                // yes,clean
                props.GoodPointsStore.adminResetSchoolGPs(msg => {//adminResetSchoolGPs returns msg :string
                    openPopups({ popup: 'ERROR', text: msg, okatText: t("close"), removePopupOnOutsideClick: true }) //4th should close on outside click
                });
            }
        })
    }
    const handleChangePWClick = () => {
        // props.history.push('change-password?b=h')
        openPopups({
            comp: AdminChangePasswordPopup,
            compProps: {}
        })
    }

    const handleOnTeachersExcelChange = (e) => {
        try {
            const file = e.target.files[0];
            openPopups(file.name, 'ERROR', [t("pop_up.continue_to_upload"), t("cancel"), (res) => {
                if (!res) {
                    return;
                }
                handleExcelParse()
            }], true);
            handleExcelParse(file);
            e.target.value = "";
        } catch (e) { openPopups(t("validation.error.load_file"), 'ERROR', [t("close")], true) }
    }

    const handleExcelParse = (file) => {
        openPopups(t("pop_up.file_loading"), 'ERROR', [false, false, null])
        xlsxParser.onFileSelection(file).then(data => {
            openPopups(null, 'LOADING');
            const allSheets = [];
            for (let sheetI in data) {//takes all sheets from excel/csv 
                if (data[sheetI].length > 100000) {
                    openPopups(`${t("pop_up.file_too_long")} ${data[sheetI].length} ${t("lines")}`, 'ERROR', [null, null, null], true)
                    return;
                }
                allSheets.push(...data[sheetI])  //take all sheets from excel/csv 
            }
            uploadExcel(allSheets);
        });
    }

    const uploadExcel = async (allSheets) => {
        let [postErr, postRes, teachers] = await props.UsersStore.adminAddMultTeachers(allSheets, NEW_USER_KEYS_HEB, NEW_USER_KEYS_TO_ENG);
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
                const toHeb = NEW_USER_KEYS_TO_HEB[postRes.errorField]
                msg += toHeb || postRes.errorField;
            }
            if (typeof postRes.errorMessage === "string") msg += " " + postRes.errorMessage
            openPopups({ text: msg, popup: 'ERROR', okayText: t("close"), cancelText: false });
            return;
        }
        props.UsersStore.addToAdminTeachersList(teachers.map(t => ({ ...t, teacherFirstName: t.firstName, teacherLastName: t.lastName, teacherGender: t.gender })))
        openPopups({ text: t("alerts.teachers_scc"), popup: 'ERROR', okayText: t("close"), cancelText: false });
    }

    const options = [
        {
            title: t("superadmin.menu.reset_points"),
            onClick: handleResetGPsClick,
            buttonText: t("superadmin.menu.reset_action"),
            text: t("superadmin.menu.reset_text"),
        },
        {
            title: t("login.change_p"),
            onClick: handleChangePWClick,
            buttonText: t("login.change_p"),
        }
    ]

    return (
        <div id="admin-settings-container">
            <div className="admin-settings-title">{t("setting")}</div>

            <div id="admin-settings-white-box" className="admin-table-container">

                <RenderAdminSettingsOptions options={options} />

                {/* <input onChange={handleOnTeachersExcelChange} id="upload-teachers" type="file" accept=".csv, .xlsx, .xls application/vnd.oasis.opendocument.spreadsheet application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" /> */}

                <div className="setting-container">
                    <button onClick={handleLogout} className="setting-button-logout">{t("logout")}</button>
                </div>

            </div>
        </div >
    );
}

export default inject("GoodPointsStore", "UsersStore")(observer(AdminSettings));
