import React from 'react';
import { inject, observer } from 'mobx-react'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import consts, { regexes } from '../consts/consts'

import DropdownItems from './dropdown_items'

import './CSS/search_student.scss'
import { translate } from '../translation/GPi18n';

class SearchStudent extends React.Component {
    constructor(props) {
        super(props);
        this.FORM_CLASSES = "d-flex justify-content-center align-items-center searchForm onFormBlur"
        this.FORM_CLASSES_ON_FOCUS = "d-flex justify-content-center align-items-center searchForm onFormFocus"
        this.state = {
            showPresetKeyboard: false,
            searchValue: "",
            dropdownTitle: this.props.t("send_gp.all_classes"),
            ddVisible: false,
            animationClass: false,
            formClasses: false,
            cancleIcon: false,
        }
        this.classesRef = React.createRef();
        this.inputRef = React.createRef();
        this.ddVisibleToFalseTO = null;
        this.searchStudentsContainer = React.createRef();
    }

    handleClassSelect = (classValue) => {
        this.setState({ dropdownTitle: classValue });
        this.ddVisibleToFalseTO = setTimeout(() => { this.setState({ ddVisible: false }) }, 1000);
        this.setState({ animationClass: false })
        // this.props.StudentsStore.class
    }

    handleOnChange = (e) => {
        let value = e && e.target ? e.target.value : (e && e.currentTarget ? e.currentTarget.value : '') //syntheticError ?!
        if (value.length) { //show cancle button
            !this.cancleIcon && this.setState({ cancleIcon: true })
        } else {
            setTimeout(() => { this.setState({ cancleIcon: false }) }, 250);
        }
        if (!(regexes.FIRST_LAST_NAME.test(value)) && value !== "") return;

        let studentsFilter = value.split('\'')
        studentsFilter = studentsFilter.length > 1 ? studentsFilter.join("\\'") : studentsFilter.join('')
        studentsFilter = studentsFilter.split('\"')
        studentsFilter = studentsFilter.length > 1 ? studentsFilter.join('\\"') : studentsFilter.join('')
        this.setState({ searchValue: value, ddVisible: false }, () => {
            let filter = this.state.searchValue;
            if (!(/^[a-zA-Zא-ת\u0621-\u064A\'\"]+$/.test(value))) { //only letters
                filter = consts.NO_STUDENTS_FILTER;
            }
            this.props.StudentsStore.setStudentsFilter(studentsFilter);
        });

    }

    handleCancelClick = () => {
        this.setState({ searchValue: "", cancleIcon: false });
        this.props.StudentsStore.setStudentsFilter(consts.NO_STUDENTS_FILTER);
        this.inputRef.current.focus();
    }

    handleDDClick = () => {
        if (this.ddVisibleToFalseTO !== null) { clearTimeout(this.ddVisibleToFalseTO) };
        if (this.state.animationClass) {
            this.closeDD()
        } else { //gonna open
            this.setState({ animationClass: true, ddVisible: true });
            //if prob with dd --> this is the outside click event
            this.searchStudentsContainer.current.addEventListener('click', (e) => { if (document.getElementById("open-dd-container") && !document.getElementById("open-dd-container").contains(e.target) && document.getElementById("list") && !document.getElementById("list").contains(e.target)) this.closeDD() }, false)
        }
    }

    closeDD = () => {
        this.ddVisibleToFalseTO = setTimeout(() => {
            this.setState({ ddVisible: false })
        }, 1000)
        this.setState({ animationClass: false });
        //if prob with dd --> this is the outside click event
        this.searchStudentsContainer.current.removeEventListener('click', this.handleDDClick, false)
    }

    handleInputFocus = (_e) => {
        let newState = { formClasses: true }
        this.state.ddVisible && (newState.ddVisible = false)
        this.setState(newState)
        this.closeDD()
    }
    handleInputBlur = (e) => {
        this.setState({ formClasses: false })
    }

    render() {
        return <div id="search-container" ref={this.searchStudentsContainer} >
            <div id="header" className="mb-1 mt-4" >{this.props.t("send_gp.who_to")}</div>
            {/* search */}
            <form className={this.state.formClasses ? this.FORM_CLASSES_ON_FOCUS : this.FORM_CLASSES} onClick={() => { this.inputRef.current.focus() }} onSubmit={(event) => { event.preventDefault() }}>


                {/* search bar */}
                <div id="searchBar_border" >
                    <input ref={this.inputRef} onBlur={(e) => { this.handleInputBlur(e) }} onFocus={(e) => { this.handleInputFocus(e) }} className={this.state.formClasses || (this.inputRef && this.inputRef.current && this.inputRef.current.value) ? "noBorderRadius" : ""} type="text" id="searchBar" value={this.state.searchValue} onChange={this.handleOnChange} placeholder={this.props.t("send_gp.search_student")} />
                </div>

                {this.state.cancleIcon ?
                    /* cancle */
                    <img src="/images/x-icon.svg" className={`pointer ${this.state.searchValue.length ? "cancle-icon-in" : "cancle-icon-out"}`} id="cancleIcon" onClick={() => { this.handleCancelClick() }} />
                    :
                    /* search button */
                    < img src="/images/searchIcon.png" className={`pointer ${this.state.formClasses ? "iconBigger" : "iconRegular"}`} id="searchIcon" />
                }
            </form>

            <div id="dropdown-container" className="pointer mt-4" >
                <div className="row align-items-center justify-content-center" id="dropdownBtn" >
                    <div id="open-dd-container">
                        <button onClick={() => { this.handleDDClick() }} tabIndex="0" className="dd-btn" >{this.state.dropdownTitle}</button>
                        <ArrowDropDownIcon id="arrow" />
                    </div>
                </div>
                {/* grades */}
                {this.state.ddVisible && <DropdownItems animationClass={this.state.animationClass} classesRef={this.classesRef} handleClassSelect={this.handleClassSelect} />}
            </div>
            <img src="/images/shadowHrCheatsheet.png" id="line-shadow" />
        </div >
    }

}

export default translate(inject("StudentsStore")(observer(SearchStudent)));
