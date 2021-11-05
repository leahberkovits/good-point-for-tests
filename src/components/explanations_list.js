import React from 'react';
import { inject, observer } from 'mobx-react'

import DarkBackgroundBehindPopup from './dark_background_behind_popup';

import MoreOptionsExplanations from './more_options_explanation'


import './CSS/more_options_list.scss'
import { useTranslate } from '../translation/GPi18n';




const ExplanationList = (props) => {
    const [clicked, setClicked] = React.useState([])
    const { t } = useTranslate();
    const { isAdmin } = props.UsersStore

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

    const closeSelf = () => {
        props.openPopups([])
    }

    return (
        <div id="more-options-container">
            <div id="options-content-container">

                <div className="option-container">
                    <div className={`${clicked[0] ? "option-content-click" : ""} option-content`} onTouchStart={() => { handleTouchStart(0) }} >
                        <div className="option-button" onClick={() => { props.openPopups([<DarkBackgroundBehindPopup closeOnClick={true} handleClick={closeSelf} />, <MoreOptionsExplanations closeExplanation={closeSelf} what="OS" done={closeSelf} />]) }} >{t("explaintions.opennings")}</div>
                    </div>
                </div>

                <div className="option-container">
                    <div className={`${clicked[1] ? "option-content-click" : ""} option-content`} onTouchStart={() => { handleTouchStart(1) }} >
                        <div className="option-button" onClick={() => { props.openPopups([<DarkBackgroundBehindPopup closeOnClick={true} handleClick={() => { closeSelf(); props.handleImageState(false); }} />, <MoreOptionsExplanations what="SMS" done={closeSelf} handleImageState={props.handleImageState} />]) }} >{t("explaintions.gp_path")}</div>
                    </div>
                </div>

                {!isAdmin ? null : <div className="option-container">
                    <div className={`${clicked[2] ? "option-content-click" : ""} option-content`} onTouchStart={() => { handleTouchStart(2) }} >
    <div className="option-button" onClick={() => { props.openPopups([<DarkBackgroundBehindPopup closeOnClick={true} handleClick={() => { closeSelf(); props.handleImageState(false); }} />, <MoreOptionsExplanations what="ADMIN_WEB" done={closeSelf} />]) }} >{t("explaintions.manager")}</div>
                    </div>
                </div>}


            </div>
        </div>
    );
}

export default inject("UsersStore")(observer(ExplanationList));