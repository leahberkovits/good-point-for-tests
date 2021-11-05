import React from 'react';
import { observer, inject } from "mobx-react"
import ChatBoxForLandingPage from '../components/chat_box_on_landing_page'

import './CSS/info_parents_sms.scss'
import { useTranslate } from '../translation/GPi18n';


const InfoForParentsSMS = (props) => { //info and pictures (--> all landing page content)
    const { t } = useTranslate();
    const weGotInfo = () => {
        chatBoxForLandingPage = <ChatBoxForLandingPage gpinfo={gpinfo} />
        props.callOnConfetti();
    }
    let gpinfo = props.GoodPointsStore.goodpointForSmsPage;
    let chatBoxForLandingPage = <div>{t("elerts.link_expire")}</div>
    gpinfo === undefined && (chatBoxForLandingPage = <div>{t("loading")}</div>)
    gpinfo && (Array.isArray(gpinfo) && !gpinfo.length ?
        (chatBoxForLandingPage = <div>{t("alerts.invalid_link")}</div>) :
        (weGotInfo())) //if array--> and is empty --> there is no such link

    let images = ["/images/sentImg.png", "/images/loginImg.png"]

    return (
        <div id="all-info-container">
            <img id="logoImage-landing" src="/images/logo.jpg" />

            <div id="box-container">
                <div className="arrow-up"></div>
                <div id="info-container">
                    {chatBoxForLandingPage}
                </div>
            </div>

            <img src={images[Math.floor(Math.random() * 2)]} id="smsPageImg" alt="happy family and kids image" />
        </div>);
}

export default inject("GoodPointsStore")(observer(InfoForParentsSMS));;