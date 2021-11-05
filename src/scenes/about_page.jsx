import React from 'react';
import { useTranslate } from '../translation/GPi18n';

import '../components/CSS/PagesCSS/about_page.scss'

const AboutPage = (props) => {
    const { t } = useTranslate();

    const handleGoBack = () => {
        console.log('handleGoBack');
        if (props.history) {
            if (typeof props.history.goBack === "function")
                props.history.goBack()
            else props.history.push("/more-options");
        }
        if (props.location && typeof props.location.reload === "function") props.location.reload()
    }

    return (
        <div id="about-container">
            <div onClick={handleGoBack} id="about-back-btn"><img src="/images/backIcon.png" color="#CCCCCC" /><div>{t("back")}</div></div>
            <a target="_blank" href="https://www.hilma.tech/"><img id="about-hilma-logo" src='/images/hilma.svg' alt={t("logo")} title={t("logo")} /></a>
            <div id="header-container" >
                <h3>{t("more_options.about.developed")}</h3>
                <h3 className="bold">{t("more_options.about.at_hilma")}</h3>
            </div>
            <div className="about-content" >
                <p>{t("more_options.about.first_p1")}</p>
                <p>{t("more_options.about.second_p1")}<strong>{t("more_options.about.project_clients")}</strong>{t("more_options.about.second_p2")}<strong>{t("more_options.about.project_name")}</strong>{t("more_options.about.second_p3")}</p>
            </div>
            <a target="_blank" href="https://www.hilma.tech/"><button id="hilma-button" >www.hilma.tech</button></a>
        </div>
    );
}

export default AboutPage;