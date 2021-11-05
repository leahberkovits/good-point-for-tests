import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'

import { Checkbox } from '@material-ui/core'

import ExcelMonthSelection from './excel_month_selection';

import '../CSS/excel_student_popup.scss';
import { useTranslate } from '../../translation/GPi18n';


const ExcelStudentPopup = (props) => {
    const { t } = useTranslate();
    const [sendMail, setSendMail] = React.useState(false);
    const [mailAni, setMailAni] = React.useState(false);
    const mailInput = React.useRef();

    let error = props.GoodPointsStore.errorExportExcel;


    const popup = React.createRef();
    let currStudent = props.GoodPointsStore.selectedStudentForExcel;
    useEffect(() => {
        props.GoodPointsStore.setError('')
    }, [])
    const sendStudentExcel = () => {
        if (sendMail) {
            let mail = mailInput.current.value;
            if (!mail.length) {
                props.GoodPointsStore.setError(t("validation.must_put_mail"))
                return;
            } else if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
                props.GoodPointsStore.setError(t("validation.wrong_mail2"));
                return;
            }
        } //TODO WTDT
        //GA
        window.gtag("event", 'export_student_excel', { event_category: "STUDENTS_SUM", event_label: "export student file." })
        props.GoodPointsStore.exportCSV(sendMail && mailInput.current.value);
        popup.current.className = "scale-out-center"
        props.backgroundDiv.current.className = "background-fade-out"
        props.removeExcelStudentsPopup()
    }

    const handleMailSelect = () => {
        mailAni && (mailInput.current.value = '')
        !sendMail && setTimeout(() => { mailInput.current && mailInput.current.focus() }, 500)
        props.GoodPointsStore.setError('');
        sendMail ? setTimeout(() => { setSendMail(false) }, 400) : setSendMail(true)
        setMailAni(mailAni => !mailAni)
    }

    const handleClose = () => {
        popup.current.className = "scale-out-center"
        props.backgroundDiv.current.className = "background-fade-out"
        props.removeExcelStudentsPopup(false)
    }

    return (
        <div id="popupContainer" className="scale-in-center" ref={popup} >
            <div id="top-popup">
                <img src="/images/homeIcon.png" id="close-popup" onClick={() => { handleClose() }} />
                <div id="title-popup" >{t("pop_up.child_report")}</div>
            </div>
            <div id="body-popup">
                <img src="/images/shadowHrCheatsheet.png" id="hr-popup" />
                <div id="nameAndClass-popup" >{`${currStudent.studentFirstName} ${currStudent.studentLastName} - ${currStudent.grade}'${currStudent.classIndex}`}</div>
                <ExcelMonthSelection show />
                <div id="mail-container" >
                    <Checkbox id="checkbox" label="email" onClick={handleMailSelect} checked={sendMail} />
                    <label htmlFor="checkbox" >{t("send_email")}</label>
                    <div id="emailInput-container">
                        {sendMail && <input className={mailAni ? "emailInputInAnimation" : "emailInputOutAnimation"} type="email" id="emailInput" ref={mailInput} onChange={() => { props.GoodPointsStore.errorExportExcel && props.GoodPointsStore.setError(false) }} />}
                    </div>
                </div>
                {error && <tr className="error-shake-animation" id="errorAlert">{error}</tr>}

                <div id="monthSelectionButton-popup" onClick={sendStudentExcel}>{t("create_report")}</div>
            </div>
        </div>
    );
}

export default inject("GoodPointsStore")(observer(ExcelStudentPopup));
