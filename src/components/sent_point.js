import React from 'react';
import { observer, inject } from "mobx-react"

import GenericTools from '../modules/tools/GenericTools';


import './CSS/sent_point.scss'
import { useTranslate } from '../translation/GPi18n';


function SentPoint(props) {
    const { t } = useTranslate();
    const [closeAni, setCloseAni] = React.useState(false)

    let gpNum = props.GoodPointsStore.getGPCounter;
    // let gpNum=1; //for testing
    let gpText = t("greetings.so_far") + " " + gpNum + " " + t("greetings.x_gps");
    if (gpNum === 1) gpText = t("greetings.one_sent") + " " + t("greetings.one"); //todo check
    let student = props.GoodPointsStore.selectedStudent


    const handleClickStart = () => {
        setCloseAni(true)
        setTimeout(async () => {
            setCloseAni(false)
            GenericTools.safe_redirect('/')
        }, 150)
    }



    return (
        <div id="sent">
            <div id="textSent"> {t("send_gp.success") + student.studentFirstName + " " + student.studentLastName}</div>
            <div id="untilNowSent">{gpText}</div>
            <img id="imageSent" src="/images/sentImg.png" alt="welcome picture" />
            <div id="submit-button-container">
                <button onClick={handleClickStart} className={closeAni ? "submit-clicked" : ""} id="submit">{t("close")}</button>
            </div>
        </div>
    );
}

export default inject("GoodPointsStore")(observer(SentPoint));