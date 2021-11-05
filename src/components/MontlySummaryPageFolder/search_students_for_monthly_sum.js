import React from 'react';
import { inject, observer } from 'mobx-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import consts, { regexes } from '../../consts/consts'


import '../CSS/search_students_for_monthly_sum.scss'
import { translate } from '../../translation/GPi18n';



class SearchStudentsForMonthlySummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: "",
        }
        this.studentsListTO = null;
    }

    handleOnChange = (e) => {
        let targetValue = !e ? '' : (e.target ? e.target.value : (e && e.currentTarget ? e.currentTarget.value : '')) //syntheticError ?!
        if (this.studentsListTO) clearTimeout(this.studentsListTO)
        if (!(regexes.FIRST_LAST_NAME.test(targetValue)) && targetValue !== "") return;
        this.setState({ searchValue: targetValue.trimStart() }, () => {
            // if (targetValue && targetValue.length && !(regexes.FIRST_LAST_NAME.test(targetValue))) { //only letters //different than search_students.js cos here, if we set filter no N0_STUDENTS_FILTER, no students will b displayed (הנחיות עיצוב)
            // return;
            // }
            let studentsFilter = targetValue.split('\'')
            studentsFilter = studentsFilter.length > 1 ? studentsFilter.join("\\'") : studentsFilter.join('')
            studentsFilter = studentsFilter.split('\"')
            studentsFilter = studentsFilter.length > 1 ? studentsFilter.join('\\"') : studentsFilter.join('')

            if (studentsFilter && studentsFilter.length) { //has length- no animation going on, ...I think this is that it is >>
                this.props.StudentsStore.setStudentsFilter(studentsFilter);
            } else {
                this.studentsListTO = setTimeout(() => {
                    this.props.StudentsStore.setStudentsFilter(consts.NO_STUDENTS_FILTER); //TO cos search value is empty -- students list will disappear
                    // this.props.handleClickedX(true); //don't remember how this helps us
                }, 500)
            }
        });
    }

    handleCancelClick = () => {
        this.setState({ searchValue: "" });
        this.props.handleClickedX(true);
        setTimeout(() => {
            this.props.StudentsStore.setStudentsFilter(consts.NO_STUDENTS_FILTER);
        }, 500)
    }

    render() {
        return (
            <form className="searchForm " onSubmit={(event) => { event.preventDefault() }}>
                {/* search bar */}
                <div id="searchBar_border" >
                    <input onClick={(e) => { e.preventDefault(); e.target.focus() }} className="" type="text" id="searchBar" value={this.state.searchValue} onChange={(e) => this.handleOnChange(e)} placeholder={this.props.t("send_gp.search_student")} />
                </div>

                {this.state.searchValue.length ?
                    /* cancle button */
                    <img src="/images/x-icon.svg" className="" id="cancelIcon" onClick={() => { this.handleCancelClick() }} />
                    : /* search button */
                    <label id="searchBar-label" htmlFor="searchBar"><img src="/images/searchIcon.png" className="" id="searchIcon" /></label>}
            </form>
        );
    }
}

export default translate(inject("StudentsStore")(observer(SearchStudentsForMonthlySummary)));
