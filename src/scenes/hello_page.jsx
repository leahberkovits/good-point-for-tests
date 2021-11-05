import React, { useEffect } from 'react';
import '../components/CSS/hello_page.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslate } from '../translation/GPi18n';
import GenericTools from '../modules/tools/GenericTools';
import { isMobile } from 'react-device-detect';


export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function HelloPage({ history }) {
    const { i18n } = useTranslate();
    useEffect(() => {
        localStorage.setItem('cancelRotate', true);
        return () => { localStorage.removeItem("cancelRotate") }
    }, [])

    function ClickLang(lang) {
        window.gtag("event", 'selected_' + lang, { event_category: "language", event_label: "language" })
        GenericTools.deleteCookieByKey('accessToken');
        GenericTools.deleteCookieByKey('klo');
        localStorage.setItem('lang', lang);
        i18n.changeLanguage(lang);
        setCookie('lang', lang, 10000);
        history.push('/login');
    }




    return <div id="hello_first_page">
        <div id="image_cont">
            <img src="/images/loginInLogo.png" alt="logo" id="welcomeLogo" />
        </div>
        <div id="video">
            <iframe width={isMobile ? '100%' : "50%"} height={isMobile ? "260" : "315"} src="https://www.youtube.com/embed/Gsqqa19Wx18?autoplay=1&listType=playlist&rel=0"
                title="נקודה טובה"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen></iframe>
        </div>
        <div id="content">
            <h1 id="desc">
                נקודה טובה
                <br />
                לקידום שיח חיובי בבית הספר
        </h1>
            <img id="people_img" src="/images/loginImg.png" alt="welcome picture" />
            <h1 id="schoolsEntery">כניסת בתי ספר</h1>
            <span>
                <button className="lang-btn" onClick={() => ClickLang("he")}>עברית</button>
                <button className="lang-btn" onClick={() => ClickLang("ar")}>عربيه</button>
            </span>
        </div>
        <img src="images/footer.png" id="footer" alt="demo picture" />
        <div id="down_content">
            <h1 id="title"> צרו קשר</h1>
            <div className="d-flex">
                <FontAwesomeIcon icon="phone" />
                <p>רחל אביגד  <a href="tel:054-7360909">054-7360909</a>
                </p>
            </div>
            <div className="d-flex">
                <FontAwesomeIcon icon="envelope" />
                <a href="mailto:nekudatova19@gmail.com">nekudatova19@gmail.com</a>
            </div>
        </div>
    </div>
}
export default HelloPage;