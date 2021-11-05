import React from 'react';
import { observer, inject } from "mobx-react"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import ValidateTool from '../../modules/tools/ValidateTool'

import PresetCategories from '../../consts/PresetCategories'
import PresetKeyboard from '../preset_keyboard'

import Consts, { regexes } from '../../consts/consts'

import { isIOS } from 'react-device-detect';


import '../../components/CSS/good_point_input.scss'
import { translate } from '../../translation/GPi18n';




class GoodPointInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showPresetKeyboard: false,
            inputValue: '',
            inputFormBottom: true,
            transform: "none",
            slideKeyboard: "none",
            slideInput: "none",
            inputErrBool: { error: false },
            presetKAnimation: true,
            disabledInput: true
        }
        this.inputRef = React.createRef();
        this.renderKeyboard = false;
        this.keyboardRef = null;

        this.socialCategRef = null;
        this.emotionalCategRef = null;
        this.educationalCategRef = null;
        this.otherCategRef = null;
    }
    resetKeyboardAnimate = (value = true) => { this.setState({ presetKAnimation: value }); }

    handlePlusClick = () => {
        if (!this.props.messagesContainer || !this.props.messagesContainer.current) return
        this.props.messagesContainer.current.scrollTop = this.props.messagesContainer.current.scrollHeight;
        try {
            if ((this.socialCategRef !== null) && (this.emotionalCategRef !== null) && (this.educationalCategRef !== null) && (this.otherCategRef !== null) && (this.socialCategRef.current !== null) && (this.emotionalCategRef.current !== null) && (this.educationalCategRef.current !== null) && (this.otherCategRef.current !== null)) {
                setTimeout(() => { //resets the selected categories to social.
                    this.props.PresetMessagesStore.selectedCateg = PresetCategories.SOCIAL;
                    this.socialCategRef.current.className = Consts.SELECTED_CATEGORY_CLASS_NAME
                    this.educationalCategRef.current.className = Consts.CATEGORY_CLASS_MAME
                    this.emotionalCategRef.current.className = Consts.CATEGORY_CLASS_MAME
                    this.otherCategRef.current.className = Consts.CATEGORY_CLASS_MAME
                }, 650);
            }
        } catch (err) { }
        this.renderKeyboard = true
        let keyboardState = !this.state.showPresetKeyboard;

        this.props.setKeyboardOpen(state => !state)

        // let xp = 0;
        // keyboardState ? xp = "30vh" : xp = "0"

        let transform = "none";
        keyboardState /* when keyboard is open */ ? (transform = "rotate3d(0, 0, 1, 45deg)") : (transform = "none")

        let slideKeyboard, slideInput = "none";
        if (keyboardState) {/* when keyboard is open */
            slideKeyboard = "slidein"
            slideInput = "slidein2"
            this.setState({ disabledInput: true })
        } else /* when keyboard is closed */ {
            slideKeyboard = "slideout"
            slideInput = "slideout2"
        }

        this.setState({ inputFormBottom: !keyboardState, presetKAnimation: true, showPresetKeyboard: keyboardState, transform: transform, slideKeyboard: slideKeyboard, slideInput: slideInput })
    }

    handleInputChange = (e) => {
        let errBool = this.state.inputErrBool.error && !(/\S/.test(e.target.value)); //if shows error and started typing:
        this.setState({ inputValue: e.target.value, inputErrBool: { error: errBool, message: this.props.t("validation.gp_empty") } })
    }
    addPresetToInputValue = (presetValue) => {
        this.setState({ inputValue: presetValue })
    }


    handleInputClick = () => {
        this.state.disabledInput &&
            this.setState({ disabledInput: false }, () => {
                document.getElementById("gp_input").focus()
            });

        if (this.state.showPresetKeyboard) { //closing presetk
            this.props.setKeyboardOpen(false)
            let transform = "none";
            let slideKeyboard = "slideout";
            let slideInput = "none";
            let presetKAnimation = !isIOS
            this.setState({ presetKAnimation, inputFormBottom: true, showPresetKeyboard: false, transform: transform, slideKeyboard: slideKeyboard, slideInput: slideInput })
        }
    }

    sendSocialCategRef = (ref, ref2, ref3, ref4) => {
        this.socialCategRef = ref;
        this.emotionalCategRef = ref2;
        this.educationalCategRef = ref3;
        this.otherCategRef = ref4;
    }

    getKeyboardRef = (ref) => {
        this.keyboardRef = ref;
    }

    setErr = (bool, msg) => {
        this.inputRef.current.focus()
        this.setState({ inputErrBool: { error: bool, message: msg } })
    }

    handleSubmit = async (e) => {
        let text = this.state.inputValue
        if (!(/\S/.test(text))) {
            this.setErr(true, this.props.t("validation.gp_empty"))
            return;
        }
        if (text.length > 5000) { //??? 
            this.setErr(true, this.props.t("validation.gp_max_length"))
            return;
        }
        const rule = { type: 'string', format: { pattern: regexes.GOOD_POINT, flags: "im", message: "invalid chars" } } //validatetool
        const successValid = await ValidateTool.runValidate(text, rule).success;
        if (!successValid) {
            this.inputRef.current.focus()
            this.setErr(true, this.props.t("validation.gp_can't"))
            return;
        }

        /* add the good point input value to the DB */
        try {
            const successPost = await this.props.GoodPointsStore.addAGP(this.state.inputValue, this.handleAddAGPErr); // couldnt make the promise work with the recursion going on there (on error)
            window.gtag("event", 'gp_sent', { event_category: "send_page", event_label: "actual_send" })

            if (successPost && typeof successPost !== "string") { this.props.changeURL("/sent-point"); }
        } catch (e) {
            this.handleAddAGPErr()
        }
    }

    handleAddAGPErr = (e) => {
        if (e && typeof e === "string") {
            this.setState({ inputErrBool: { error: true, message: e } })
        }
    }

    render() {
        let inputValue = this.state.inputValue;
        // returns the fixed input box and opens preset keyboard when needed 

        return <div id="input_container" >
            <div id="inputForm-container" className={this.state.inputFormBottom ? "inputForm-down" : "inputForm-up"} style={{ animationName: this.state.slideInput }}>
                <form id="inputForm" >

                    {/* keyboard plus button */}
                    <FontAwesomeIcon style={{ transform: this.state.transform }} className="pointer align-self-center" icon="plus" id="plusIcon" onClick={this.handlePlusClick} />

                    {/* text input */}
                    <div id="gp_input_border" className="align-self-center" onClick={(e) => { this.handleInputClick(e) }}>

                        <textarea
                            disabled={this.state.disabledInput}
                            className="align-self-center"
                            id="gp_input"
                            ref={this.inputRef}
                            type="text"
                            placeholder={this.props.t("send_gp.write")}
                            value={inputValue}
                            onFocus={(e) => { this.handleInputClick(e); e.target.placeholder = ""; }}
                            onBlur={(e) => { e.target.placeholder = this.props.t("send_gp.write"); this.props.setKeyboardOpen(false) }}
                            onChange={(e) => this.handleInputChange(e)} />
                    </div>

                    {/* send button */}
                    <img src="/images/send_icon.png" className="pointer align-self-center" id="sendIcon" onClick={(e) => { this.handleSubmit(e) }} onDoubleClick={() => { }} alt={this.props.t("send")} />

                </form>

                <div>{this.state.inputErrBool.error ? <div className="row">{this.state.inputErrBool.message}</div> : null}</div>
            </div>
            {this.renderKeyboard && <PresetKeyboard addPresetToInputValue={this.addPresetToInputValue} sendKeyboardRef={this.getKeyboardRef} sendSocialCategRef={this.sendSocialCategRef} display={this.state.showPresetKeyboard} slide={this.state.slideKeyboard} presetKAnimation={this.state.presetKAnimation} resetKeyboardAnimate={this.resetKeyboardAnimate} />}

        </div>
    }
}

export default translate(inject("PresetMessagesStore", "GoodPointsStore")(observer(GoodPointInput)));
