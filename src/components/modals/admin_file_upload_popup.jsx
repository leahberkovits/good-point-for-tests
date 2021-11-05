import React from 'react'
import { useTranslate } from '../../translation/GPi18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './admin_file_upload_popup.scss';

export const AdminFileUploadPopup = ({ closePopups, fileName, onClick, title }) => {


    const { t } = useTranslate();

    const handleClick = (res) => () => {
        onClick(res);
        closePopups()
    }
    return (
        <div className="admin_popups admin-file-upload-popup">
            <div className="admin-file-upload-title">{typeof title === "string" ? title : t("admin.upload_excel")}</div>
            <div className="admin-file-upload-fileName-icon-container">
                <FontAwesomeIcon icon="file" className="admin-file-upload-icon" />
                <div className="admin-file-upload-fileName" >{fileName}</div>
            </div>

            <div className="new-instance-buttons-container">
                <div className="cancelAdminForm" onClick={handleClick(false)}> {t("cancel")} </div>
                <div className="saveAdminForm" onClick={handleClick(true)}> {t("upload")} </div>
            </div>

        </div>
    )
}
