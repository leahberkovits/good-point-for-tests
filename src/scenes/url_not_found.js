import React from 'react';

import GenericTools from '../modules/tools/GenericTools'


import '../components/CSS/url_not_found.scss'
import { useTranslate } from '../translation/GPi18n';



const UrlNotFound = () => {
    const { t } = useTranslate();
    return (
        <div id="urlnotfound">
            <div id="text-container">
                <div id="hellotext">{t("hello")}</div>
                <div id="maintext">
                    <div>
                        {t("page_not_found")}
                    </div>
                </div>
            </div>

            <div onClick={() => { GenericTools.safe_redirect("/") }} id="gohomebtn">{t("back_home")}</div>
        </div>
    );
}

export default UrlNotFound;