import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer, inject } from "mobx-react"
import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'
import { translate } from '../translation/GPi18n';
import './CSS/opening_sentences.scss'

class OpeningSentencesForm extends React.Component {
    constructor(props) {
        super(props)
        this.GENDER_CLASS_NAME = 'gender-option black'; //don't have to add the 'black' className
        this.SELECTED_GENDER_CLASS_NAME = 'gender-option pink';
        this.state = {
            classes: [this.GENDER_CLASS_NAME, this.GENDER_CLASS_NAME, this.SELECTED_GENDER_CLASS_NAME]
        }
        this.input = React.createRef();
    }

    selectGender = (e, gender) => {
        (this.props.PresetMessagesStore.osFormError.length > 0) && (this.props.PresetMessagesStore.osFormError = ''); // TODO see in opening sentences "TODO -shani-"
        this.props.PresetMessagesStore.selectedGender = gender;
        this.props.PresetMessagesStore.studentGender = null;

        let classesArr = this.state.classes;
        classesArr = classesArr.map(() => this.GENDER_CLASS_NAME)
        classesArr[e.target.id] = this.SELECTED_GENDER_CLASS_NAME;
        this.setState({ classes: classesArr })
        this.input.current.focus();
    }
    render() {
        return (
            <div className={this.props.formClass ? "scale-in-animation" : "scale-out-animation"} id="os-form-container">
                <div className="d-flex justify-content-center">
                    <hr id="formHr" />
                </div>

                <form id="os-form" className="d-flex align-items-center" name="form" >

                    <input autoFocus={!this.props.firstOS} onFocus={this.props.removeOSInstruc} className="mx-4" ref={this.input} id="textBox" type="text" onChange={(e) => { this.props.changeValue(e) }} onKeyPress={(e) => { e.key.toLowerCase() === "enter" && this.props.handleSubmit(e) }} value={this.props.inputValue} />

                    <div onClick={(e) => { this.props.handleInputClose(e) }} id="remove-typing-container" >
                        <img src="/images/x-icon.svg" className="form-btn" id="remove-typing" />
                    </div>

                    <img src="/images/check-icon.svg" className="ml-3 form-btn" id="submit-check" onClick={(e) => { this.props.handleSubmit(e) }} />

                </form>

                <div className="mx-4 d-flex justify-content-start align-items-center" id="gender-selection">
                    <span id={0} onClick={(e) => { this.selectGender(e, GenderOptionsLowerCased.MALE) }} className={this.state.classes[0]}>{this.props.t("genders.male")}</span>

                    <span className="vl"></span>

                    <span id={1} onClick={(e) => { this.selectGender(e, GenderOptionsLowerCased.FEMALE) }} className={this.state.classes[1]}>{this.props.t("genders.female")}</span>

                    <span className="vl"></span>

                    <span id={2} onClick={(e) => { this.selectGender(e, GenderOptionsLowerCased.NONE) }} className={this.state.classes[2]}>{this.props.t("genders.without")}</span>
                </div>


                {(this.props.PresetMessagesStore.getOsFormError.length > 0) && <p id="osFormError">{this.props.PresetMessagesStore.getOsFormError}</p>}
                <div className="d-flex justify-content-center">
                    <hr id="formHr" />
                </div>


            </div>
        );
    }
}

export default translate(inject("PresetMessagesStore")(observer(OpeningSentencesForm)));
