import React, { useMemo } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './admin_excel_upload_info_popup.scss';
import { useTranslate } from '../../translation/GPi18n';
import { useConsts } from '../../contexts/constsContext';

const getAllInfo = (currTable, t, consts) => {

    const CurrTableToNames = {
        [consts.ADMIN_CLASSES_TABLE]: {
            typePlural: t("classes"),
            typeSingle: t("class"),
        },
        [consts.ADMIN_STUDENTS_TABLE]: {
            typePlural: t("students_plural"),
            typeSingle: t("student_plural"),
        },
        [consts.ADMIN_TEACHERS_TABLE]: {
            typePlural: t("teachers_plural"),
            typeSingle: t("teacher"),
        }
    }
    const currTableNames = CurrTableToNames[currTable]
    if (!currTableNames) return null;
    const { typePlural, typeSingle } = currTableNames;

    return {
    /* 1 */Title: `${t("upload_file")} ${typePlural}`,
    /* 2 */Text1: `${t("excel_explanation.p1")} ${typePlural}:`,
    /* 2 */Text2: `${t("excel_explanation.p2")}${typeSingle} ${t("excel_explanation.p3")}${typePlural}.`,
    /* 3 */MiniTitle: t("excel_explanation.p4"),
    /* 4 */Bullets: [t("excel_explanation.p6"), t("excel_explanation.p5")],
    /* 5 */HeadersTitle: t("excel_explanation.p7"),
        [consts.ADMIN_CLASSES_TABLE]: {
            Headers: consts.HEBREW_CLASSES_EXCEL_HEADERS.join(", "),
            Bullets: [
                t("excel_explanation.li5"),
                t("excel_explanation.li6"),// grades change
                t("excel_explanation.li7")
            ],
            DownloadExample: {
                text: t("excel_explanation.child_list_example"), href: consts.EXCEL_TEMPLATE_CLASSES_NAME
            }
        },
        [consts.ADMIN_STUDENTS_TABLE]: {
            Headers: consts.HEBREW_EXCEL_HEADERS.join(", "),
            Bullets: [
                t("excel_explanation.li1"),
                t("excel_explanation.li2"),
                t("excel_explanation.li3"),
                t("excel_explanation.li4"),

            ],

            DownloadExample: {
                text: t("excel_explanation.class_list_example"), href: consts.EXCEL_TEMPLATE_STUDENTS_NAME,
            }
        },
        [consts.ADMIN_TEACHERS_TABLE]: {
            Headers: consts.NEW_USER_KEYS_HEB.join(", "),
        }
    }
}

export const AdminExcelUploadInfoPopup = ({ currTable, closePopups }) => {
    const { t } = useTranslate();
    const consts = useConsts();
    const info = useMemo(() => getAllInfo(currTable, t, consts), [currTable]);

    if (!info) { closePopups(); return; };

    return (
        <div className="admin_popups" id="admin-excel-upload-info-popup-container">
            <FontAwesomeIcon icon="times" id="x" onClick={closePopups} />
            <div id="admin-excel-upload-info-popup-title">{info.Title}</div>
            <div className="admin-excel-upload-info-popup-text" id="admin-excel-upload-info-popup-text1">{info.Text1}</div>
            <div className="admin-excel-upload-info-popup-text" id="admin-excel-upload-info-popup-text2">{info.Text2}</div>
            <div id="admin-excel-upload-info-popup-mini-title">{info.MiniTitle}</div>
            {Array.isArray(info.Bullets)
                ? <div id="admin-excel-upload-info-popup-bullet-g1-container">
                    {info.Bullets.map(b => (<div key={b} className="admin-excel-upload-info-popup-bullet-g1" >{b}.</div>))}
                </div>
                : null}
            <div id="admin-excel-upload-info-popup-headersInfo" ><span>{info.HeadersTitle}</span>{" " + info[currTable].Headers}</div>
            {Array.isArray(info[currTable].Bullets)
                ? <div id="admin-excel-upload-info-popup-bullet-g2-container">{info[currTable].Bullets.map(b => (<div key={b} className="admin-excel-upload-info-popup-bullet-g2" >{b}</div>))}</div>
                : null}
            <button className="saveAdminForm" onClick={closePopups} >{t("close")}</button>
        </div>
    )
}
