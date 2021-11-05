import React from 'react';
import { inject, observer } from 'mobx-react'

import { Button } from '@material-ui/core';

import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'


import './CSS/more_options_explanation.scss'
import { useTranslate } from '../translation/GPi18n';



const MoreOptionsExplanations = (props) => {
    const { t } = useTranslate();

    const userInfo = props.UsersStore.fullName;
    if (!userInfo) return;
    const female = userInfo.gender.toLowerCase() === GenderOptionsLowerCased.FEMALE;


    const exps = {
        "OS": t("explaintions.open.os"),
        "SMS": `${t("the_good_points")} ${female ? t("explaintions.open.sms.female") : t("explaintions.open.sms.male")} ${t("explaintions.open.sms.text")}`,
        "ADMIN_WEB": `${t("explaintions.open.admin_web.should_know")}, ${female ? t("explaintions.open.admin_web.asF") : t("explaintions.open.admin_web.asM")} ${t("explaintions.open.admin_web.you_can")} ${female ? t("explaintions.open.admin_web.adminF") : t("explaintions.open.admin_web.adminM")} ${t("explaintions.open.admin_web.will_open")}`
    }

    if (!Object.keys(exps).includes(props.what)) return;



    return (
        <div onClick={props.closeExplanation} id="os-explain-container" >
            <div>
                <span> {exps[props.what]} </span>
                {props.what === "SMS" ? <span id="here-smspage-explanation" onClick={() => { props.handleImageState(true) }} >{t("here")}</span> : null}
            </div>
            <div id="button-container">
                <Button variant="outlined" onClick={props.done}>{t("close")}</Button>
            </div>
        </div>
    );
}
export default inject("UsersStore")(observer(MoreOptionsExplanations));
