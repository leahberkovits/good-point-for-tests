import React from 'react';
import { PWA, AddToHomeScreen } from './pwa'
import './CSS/more_options_list.scss'
import { useTranslate } from '../translation/GPi18n';
import DarkBackgroundBehindPopup from './dark_background_behind_popup';
import { Button } from '@material-ui/core';
import clientLanguages from '../translation/languages.json';


const MoreOptionsList = (props) => {
    const { t } = useTranslate();
    const [clicked, setClicked] = React.useState([])

    const [pwa /*,setPwa*/] = React.useState(PWA.checkIfNotPWA(true))
    const [dialog, setDialog] = React.useState(false)
    const [changeLang, setChangeLang] = React.useState(false)

    const handleTouchStart = (i) => {
        let c = [...clicked]
        c[i] = true;
        setClicked(c)
        setTimeout(() => {
            let c = [...clicked]
            c[i] = false;
            setClicked(c)
        }, 150);
    }
    // <DarkBackgroundBehindPopup closeOnClick={true} handleClick={() => { closeSelf(); props.handleImageState(false); }} />, <MoreOptionsExplanations what="ADMIN_WEB" done={closeSelf} />]) }} 

    return (
        <div id="more-options-container">
            <div id="options-content-container">

                <AddToHomeScreen open={dialog} setOpen={setDialog} />
                <div className="option-container">
                    <div className={`${clicked[0] ? "option-content-click" : ""} option-content`} onTouchStart={() => { handleTouchStart(0) }} >
                        <div className="option-button" onClick={() => { props.changeUrl("/change-password") }} >{t("login.change_p")}</div>
                    </div>
                </div>

                {!pwa ? null :
                    <div className="option-container">
                        <div className={`${clicked[1] ? "option-content-click" : ""} option-content`} onTouchStart={() => { handleTouchStart(1) }} >
                            <div className="option-button" onClick={() => setDialog(true)} >{t("more_options.pwa")} </div>
                        </div>
                    </div>
                }
                <div className="option-container">
                    <div className={`${clicked[2] ? "option-content-click" : ""} option-content`} onTouchStart={() => { handleTouchStart(2) }} >
                        <div className="option-button" onClick={() => { setChangeLang(true) }}>{t("more_options.changeLang.title")}</div>
                    </div>
                </div>

                <div className="option-container">
                    <div className={`${clicked[3] ? "option-content-click" : ""} option-content`} onTouchStart={() => { handleTouchStart(3) }} >
                        <div className="option-button" onClick={() => { props.changeUrl("/about") }}>{t("more_options.about.title")}</div>
                    </div>
                </div>

            </div>
            {changeLang && <ChangeLanguageModal closeSelf={() => { setChangeLang(false) }}></ChangeLanguageModal>}
        </div>
    );
}

export default MoreOptionsList;


export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function ChangeLanguageModal({ closeSelf, ...props }) {
    const { t, i18n } = useTranslate();

    function setLang(lang) {
        localStorage.setItem('lang', lang);
        i18n.changeLanguage(lang);
        setCookie('lang', lang, 10000);
        closeSelf();
    }

    return <div>
        <div onClick={closeSelf} id="change-language-container" >
            <div className="d-flex">
                <h4>{t("more_options.changeLang.choose")}</h4>
                {Object.values(clientLanguages).map(item => <Button key={item.shortcat} variant="outlined" onClick={() => { setLang(item.shortcat) }} className="lang-btn">{item.name}</Button>)}
            </div>
            <div id="button-container">
                <Button variant="outlined" onClick={closeSelf}>{t("close")}</Button>
            </div>
        </div>
        <DarkBackgroundBehindPopup closeOnClick={true} handleClick={closeSelf} />

    </div>

}