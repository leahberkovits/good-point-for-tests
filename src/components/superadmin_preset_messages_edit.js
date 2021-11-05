import React from 'react';
import { inject, observer } from 'mobx-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Button } from '@material-ui/core';

import { convertPresetGender, convertCateg } from '../consts/PresetCategories';

import ErrorPopup from './super_admin_error_popup'

import NewSystemPM from './new_system_pm';

import './CSS/superadmin_preset_messages_edit.scss';
import { useTranslate } from '../translation/GPi18n';



const SuperAdminPresetMessagesEdit = (props) => {
    const [popups, setPopups] = React.useState(null);
    const { t } = useTranslate();
    let errMsg = null;
    let pms = props.PresetMessagesStore.superadminPMs;
    let pmsTDs;

    if (!pms || pms === null) return <div>{t("loading")}</div>

    if (!pms.length) errMsg = `${t("errors.not_found")} ${t("opennings")}`
    else
        pmsTDs = pms.map(pm => {
            return (
                <tr key={pm.id} >
                    <td>{pm.text}</td>
                    <td>{t("opennings_msg.categories." + pm.presetCategory)}</td>
                    <td>{t("genders." + pm.gender.toLowerCase())}</td>
                    <td>
                        <FontAwesomeIcon id="superadmin-delete-icon" onClick={() => { handleDelete(pm) }} title={t("superadmin.close.delete_open")} icon="trash-alt" />
                    </td>
                </tr>
            );
        })


    const handleDelete = (pm) => {
        setPopups([<ErrorPopup text={t("superadmin.close.sure_to_delete")} okayText={t("im_sure")} cancelText={t("superadmin.clean.no_cancel")} handlePopupClick={(res) => {
            if (!res) return;
            props.PresetMessagesStore.superadminDeletePM(pm.id);
        }} openPopups={setPopups} />])
    }

    const handleAddNewPM = () => {
        setPopups([<NewSystemPM openPopups={setPopups} />])
    }



    return (
        <div>
            <div className="superadmin-popup" id="pm-edit-container" >
                <h5>{t("superadmin.edit_opennings")}</h5>
                <div id="superadmin-table-container">
                    <table id="superadmin-table">
                        <tr>
                            <th>{t("opennings_msg.the_msg")}</th>
                            <th>{t("opennings_msg.category")}</th>
                            <th>{t("gender")}</th>
                            <th></th>
                        </tr>
                        {pmsTDs}
                    </table>
                    {errMsg ? errMsg : null}
                </div>
                <div id="sa-pm-edit-buttons-container">
                    <Button variant="outlined" onClick={handleAddNewPM} >+</Button>
                    <Button variant="outlined" onClick={() => { props.setPopup(null) }} >{t("end")}</Button>
                </div>
            </div >

            {popups && popups.length ? popups.map(p => p) : null}
        </div>
    );
}

export default inject("PresetMessagesStore")(observer(SuperAdminPresetMessagesEdit));
