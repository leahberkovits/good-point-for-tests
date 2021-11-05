import React from 'react';
import { observer, inject } from "mobx-react"

import { Link } from 'react-router-dom'


import { useTranslate } from "../translation/GPi18n";

import './CSS/send_a_good_point_button.scss'

let removed = false;

function SendAGoodPointButton(props) {

    const { t } = useTranslate();

    const removeInstructions = () => {
        if (!removed) { // no reason to do this more than once
            props.UsersStore.removeInstrucPopups();
            props.UsersStore.removeSendAGPBubble()
        }
        removed = true
        //GA
        window.gtag("event", 'send_gp', { event_category: "home_page", event_label: "Click the + icon." })
    }

    return <div id="sendGp-container" className="d-flex justify-content-center">
        <Link to="/send-a-good-point" onClick={removeInstructions}>
            <img src="/images/pinkPlusIcon2.png" alt={t("create_gp.send_gp")} id="sendGp-img" />
        </Link>

        {(props.withBubble) && <div id="bubble-container" onClick={removeInstructions}>
            <img src="/images/bubble.png" id="bubble-box" />
            <div id="text" >{t("create_gp.add_gp")}</div>
        </div>}
    </div>
}
export default inject("GoodPointsStore", "UsersStore")(observer(SendAGoodPointButton));