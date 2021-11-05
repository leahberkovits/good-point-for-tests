import React from 'react';

import { useTranslate } from '../translation/GPi18n';
import consts from '../consts/consts';
import Top from '../components/top'
import ChangePWForm from '../components/change_pw_form';

const ResetPasswordPage = (props) => {
    const { t } = useTranslate();
    let back = new URLSearchParams(props.location.search).get("b") === "h" ? consts.JUST_GO_BACK : "/more-options"
    return (
        <div>
            <Top text={t("login.change_p")} back={back} home={true} />
            <ChangePWForm />
        </div>
    );
}

export default ResetPasswordPage;