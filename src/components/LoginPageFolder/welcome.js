import React from 'react';
import { useTranslate } from '../../translation/GPi18n';
import '../CSS/welcome.scss'

const Welcome = () => {
    const { t, i18n } = useTranslate();

    return i18n.language === "he" ?
        <div id="welcome-second-container">
            <div dir="ltr" id="welcome-words">{t("login.welcome_to")} </div>
            <img src="/images/loginInLogo.png" alt="logo" id="welcomeLogo" />
        </div> :
        <div id="welcome-second-container">
            <div dir="ltr" id="welcome-words" className="pink">{t("login.welcome_to")} </div>
            <div style={{
                width: "100vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline"
            }}>  <img src="/images/transparentIcon.png" alt="logo" id="welcomeLogo" />
                <h2 className="gp" >{t("good_point")}</h2>
            </div>
        </div >
}

export default Welcome;
