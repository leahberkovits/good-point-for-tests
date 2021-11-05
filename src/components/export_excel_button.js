import React, { useState, useRef } from 'react';
import { inject, observer } from 'mobx-react'

import { Checkbox } from '@material-ui/core'

import './CSS/export_excel_button.scss'
import { useTranslate } from '../translation/GPi18n';


function ExportExcelButton(props) {
    const { t } = useTranslate();
    const [sendMail, setSendMail] = React.useState(false);
    const [mailAni, setMailAni] = React.useState(false);
    const [excelButtonAni, setExcelButtonAni] = React.useState(false)
    const [excelButtonDisplay, setExcelButtonDisplay] = React.useState(false)
    const [excelClick, setExcelClick] = React.useState(false)
    const mailInput = useRef();

    let error = props.GoodPointsStore.errorExportExcel;
    let show = props.GoodPointsStore.displayExportButton;

    const handleExport = async () => {
        if (!excelButtonDisplay) return;
        props.GoodPointsStore.setError('');
        if (sendMail) {
            let mail = mailInput.current.value;
            if (!mail.length) {
                props.GoodPointsStore.setError(t("validation.must_put_mail"))
                return;
            } else if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
                props.GoodPointsStore.setError(t("validation.wrong_mail2"));
                return;
            }
        }
        //GA
        window.gtag("event", 'export_classes_excel', { event_category: "CLASSES_SUM", event_label: "export_classes_xl" })

        await props.GoodPointsStore.exportCSV(sendMail && mailInput.current.value);
    }

    const handleMailSelect = () => {
        mailAni && mailInput.current && (mailInput.current.value = '')
        !sendMail && setTimeout(() => { mailInput.current && mailInput.current.focus() }, 500)
        props.GoodPointsStore.setError('');
        sendMail ? setTimeout(() => { setSendMail(false) }, 400) : setSendMail(true)
        setMailAni(mailAni => !mailAni)
    }

    if (show && !excelButtonAni) {
        setExcelButtonDisplay(true);
        setExcelButtonAni(true);
    }
    if (!show && excelButtonAni) {
        props.GoodPointsStore.setError('');
        setMailAni(false)
        setTimeout(() => { setSendMail(false) }, 400)
        setExcelButtonAni(false);
        setTimeout(() => {
            setExcelButtonDisplay(false);
        }, 500)
    }

    // if (error) {// setTimeout(() => { props.GoodPointsStore.setError(false) }, 2500) //do we want the error messge to dissapear after 2.5s? it currently dissapears on input typing
    // }

    return <div id="exportbutton-container" className={excelButtonAni ? "withEmail" : "withoutEmail"} >
        <table id="sendToEmail-container">
            <tbody>
                {error ? <tr className="error-shake-animation" id="errorAlert"><td>{error}</td></tr> : null}
                <tr className={excelButtonAni ? "slide-in-bottom-animation" : "slide-out-bottom-animation"} id="sendMail-tr">

                    <td id="checkbox-td">
                        <Checkbox label="email" onClick={handleMailSelect} checked={sendMail} />
                    </td>
                    <td id="text-td" >{t("send_email")}</td>
                    <td id="input-td" >
                        {sendMail && <input className={mailAni ? "emailInputInAnimation" : "emailInputOutAnimation"} type="email" id="emailInput" ref={mailInput} onChange={() => { props.GoodPointsStore.errorExportExcel && props.GoodPointsStore.setError(false) }} />} {/* problem--> when open (after 'send mail' selection click) keyborad is open and vh changes --> so the export excel container is over the classes sum but the excel container (20vh height) becomes less, so even if giving it a white background (so u dont see the classes sum) it will cover only part of excel container as we know it*/}
                    </td>
                </tr>
            </tbody>
        </table>
        <div className={`${excelButtonAni ? "not-disabled" : "disabled"} ${excelButtonAni && excelClick ? "not-disabled-click" : ""}`} onClick={handleExport} onTouchStart={() => { setExcelClick(true); setTimeout(() => { setExcelClick(false) }, 400) }} id="exportbutton">{t("create_report")}</div>
    </div>
}

export default inject("GoodPointsStore")(observer(ExportExcelButton));