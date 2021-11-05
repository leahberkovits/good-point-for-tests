import React from 'react';

import { withRouter } from 'react-router';
import { useTranslate } from "../translation/GPi18n";

import './CSS/parents_landing_page_copy_to_clipboard.scss'


const CopyToClipboard = (props) => {
    const {t} = useTranslate();

    const [copiedAlert, setCopiedAlert] = React.useState(false);

    var copiedTO = null;


    const copyToClipboard = () => {
        const shareData = {
            title: t("good_point"),
            text: t("want_to_share_gp"),
            url: window.location.href
        };
        (async () => {
            try {
                await navigator.share(shareData)
            } catch (err) {
                clearTimeout(copiedTO)
                const el = document.createElement('textarea');
                el.value = window.location.href;
                el.setAttribute('readonly', '');
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                el.style.color = 'transparent';
                el.style.backgroundColor = 'transparent';
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                setCopiedAlert(true)
                copiedTO = setTimeout(() => { setCopiedAlert(false) }, 3000)
            }

        })()
    }

    return (
        <div onClick={copyToClipboard} id="shareBtn">
            <img id="shareIcon" src="/images/shareIcon.png" />
            <div id="shareText">{t("share")}</div>
            {copiedAlert ? <div id="copies-successfully-msg" className="alertMsg" >{t("alerts.link_copied")}</div> : null}

        </div>
    );
}

export default withRouter(CopyToClipboard);