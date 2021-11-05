import React from 'react';
import eduImg from '../../modules/idm/client/imgs/edu.png';
import { useTranslate } from '../../translation/GPi18n';
const IDM_URL = 'https://is.remote.education.gov.il/nidp/oauth/nam/authz?client_id=2d938a37-0fe3-46c8-a619-e4cb8284ab4d&scope=openid%20profile%20eduorg%20edustudent&response_type=code&reut_data=hihi&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fidmcallback';
function serialize(obj, prefix) {
    let str = [], p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            let k = prefix ? prefix + '[' + p + ']' : p;

            let v = obj[p];
            str.push((v !== null && typeof v === 'object')
                ? serialize(v, k)
                : encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
    }
    return str.join('&');
};

const IDMLogin = ({ redirectUrl, ...props }) => {
    const { t } = useTranslate();

    let loc = window.location.origin + (window.location.hash[0] === "#" ? `/#${redirectUrl || '/samples'}` : `${redirectUrl || '/samples'}`);
    let origin = serialize({ state: loc });


    const handleIDMLogin = () => {
        window.location.href = IDM_URL + "&" + origin;
    }

    return (
        <button onClick={handleIDMLogin} type='button' id="idm" className='btn btn-warning login_input'>
            {t("login_identity_system")}
            <img src={eduImg} height="40px" width="40px" alt={t("own")}></img>
        </button>
    );
}

export default IDMLogin;