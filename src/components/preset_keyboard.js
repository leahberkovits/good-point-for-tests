import React from 'react';
import { observer, inject } from "mobx-react"

import Presetcategories from '../consts/PresetCategories'
import PresetTextByCategory from './preset_text_by_category'

import './CSS/preset_keyboard.scss';
import { translate } from '../translation/GPi18n';



class PresetKeyboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedToFalse: false
        };

        this.keyboard = React.createRef();
        this.socialCateg = React.createRef();
        this.emotionalCateg = React.createRef();
        this.educationalCateg = React.createRef();
        this.otherCateg = React.createRef();
    }

    componentDidMount() {
        this.props.sendKeyboardRef(this.keyboard);
        this.props.sendSocialCategRef(this.socialCateg, this.emotionalCateg, this.educationalCateg, this.otherCateg);
    }

    componentDidUpdate() {
        if (this.state.checkedToFalse) this.setState({ checkedToFalse: false })
        try {
            if (!this.props.display) {
                if (this.props.presetKAnimation)
                    setTimeout(() => {
                        this.keyboard.current.className = "d-none";
                    }, 640)
                else this.keyboard.current.className = "d-none";

            }
            else {
                this.keyboard.current.className = "d-block";
                this.props.resetKeyboardAnimate()
            }
        } catch (err) { }
    }

    handleCategClick = (categ) => {
        this.props.PresetMessagesStore.selectedCateg = categ;
        this.setState({ checkedToFalse: true })
    }


    render() {
        // returns the 4 categories as a nav
        const { t } = this.props
        return <div>
            <div id="keyboard-container" ref={this.keyboard} style={{ animationName: this.props.slide }}>

                <ul className="nav nav-tabs d-flex justify-content-around" id="categories" role="tablist">
                    <li className="nav-item pointer">
                        <span className="nav-link text-center align-middle active" ref={this.socialCateg} id="social-nav" data-toggle="tab" onClick={() => { this.handleCategClick(Presetcategories.SOCIAL) }} role="tab" aria-controls="social" aria-selected="true">{t("send_gp.social")}</span>
                    </li>
                    <li className="nav-item pointer">
                        <span className="nav-link text-center align-middle" ref={this.emotionalCateg} id="emotional-nav" data-toggle="tab" onClick={() => { this.handleCategClick(Presetcategories.EMOTIONAL) }} role="tab" aria-controls="emotional" aria-selected="false">{t("send_gp.emotional")}</span>
                    </li>
                    <li className="nav-item pointer">
                        <span className="nav-link text-center align-middle" ref={this.educationalCateg} id="educational-nav" data-toggle="tab" onClick={() => { this.handleCategClick(Presetcategories.EDUCATIONAL) }} role="tab" aria-controls="educational" aria-selected="false">{t("send_gp.edu")}</span>
                    </li>
                    <li className="nav-item pointer">
                        <span className="nav-link text-center align-middle" ref={this.otherCateg} id="other-nav" data-toggle="tab" onClick={() => { this.handleCategClick(Presetcategories.OTHER) }} role="tab" aria-controls="other" aria-selected="false">{t("send_gp.other")}</span>
                    </li>
                </ul>

                <PresetTextByCategory checkedToFalse={this.state.checkedToFalse} addPresetToInputValue={this.props.addPresetToInputValue} />

            </div>
        </div>;
    }
}

export default translate(inject("PresetMessagesStore")(observer(PresetKeyboard)));


