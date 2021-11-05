import React from 'react';
import { observer, inject } from "mobx-react"
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import consts from '../../consts/consts'
import { getYearOfSelectedMonth } from '../../consts/funcs';

import utils from '../functionUtils'

import '../CSS/my_activity.scss'
import { withContext } from '@hilma/tools';
import { ConstsContext } from '../../contexts/constsContext';

import GPByMonth from './gp_by_month'
import { translate } from '../../translation/GPi18n';

class MyActivity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            monthSelectedBoolArr: [],
            ddVisible: false,
            animationClass: false
        };
        this.d = new Date();

        this.monthNames = []
        this.monthNumbers = [];
        this.selectedMonth = '';
        this.monthForDDTitle = this.monthNames[0] || '';
        this.ddRef = React.createRef();
        this.ddVisibleToFalseTO = null;
    }

    componentDidMount() {
        this.getMonthNames();
    }

    getMonthNames = () => {
        let month = this.d.getMonth(); // 0-11
        const currMonth = month;
        this.selectedMonth = month;
        this.props.GoodPointsStore.setSelectedMonth = this.selectedMonth + 1; // see if this fixes the prob that when on diff scene -> press x btn to go home -> could not show info
        const monthsDisplayed = [];
        const d = new Date();
        const currYear = d.getFullYear();
        let yearOfMonth = currYear;


        while (month !== 7) {

            yearOfMonth = getYearOfSelectedMonth(month, currMonth, currYear)
            // getYearOfSelectedMonth works. just in case, this works too:
            // yearOfMonth = ((this.selectedMonth >= 8 && this.selectedMonth <= 11) && (month >= 0 && month <= 7))
            //     ? (Number(currYear) + 1)
            //     : (((month >= 8 && month <= 11) && (this.selectedMonth >= 0 && this.selectedMonth <= 7)) ? (Number(currYear) - 1) : currYear);
            monthsDisplayed.push(this.props.consts.HEBREW_MONTHS[month] + " " + yearOfMonth.toString().substr(-2));

            this.monthNumbers.push(month);

            (month === 0) ? month = 11 : month--;

        }
        this.monthNames = monthsDisplayed
        this.setState({ monthSelectedBoolArr: [true] });
        this.monthForDDTitle = monthsDisplayed[0]

    }

    handleMonthClick = (monthName, monthIndex) => {
        //update title on dropdown list
        this.monthForDDTitle = monthName;
        // updates the state arr of the buttons so only the selected button is true
        let monthsSelectedArr = this.state.monthSelectedBoolArr;
        for (let i = 0; i < monthsSelectedArr.length; i++) {
            monthsSelectedArr[i] = false;
        }
        monthsSelectedArr[monthIndex] = true;

        this.ddVisibleToFalseTO = setTimeout(() => {
            this.setState({ ddVisible: false })
        }, 1000)

        this.setState({ monthSelectedBoolArr: monthsSelectedArr, animationClass: false }, () => {
            this.selectedMonth = this.monthNumbers[monthIndex];
            this.props.GoodPointsStore.setSelectedMonth = this.selectedMonth + 1;
        })
        var elmnt = document.getElementById("home-page-container");
        elmnt.scrollTo(0, utils.viewportToPixels('23vh'));

    }

    handleDDClick = () => {
        if (this.ddVisibleToFalseTO) { clearTimeout(this.ddVisibleToFalseTO) };
        if (this.state.animationClass) {
            this.ddVisibleToFalseTO = setTimeout(() => {
                this.setState({ ddVisible: false })
            }, 1000)
            if (this.ddVisibleToFalseTO) this.setState({ animationClass: false });

        } else {
            this.setState({ animationClass: true });
            this.setState({ ddVisible: true });
        }
    }

    startFromTop = (e) => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.body.scrollTop = 0
            document.documentElement.scrollTop = 0
        }
    }
    handleOutsideClick = (_e) => {
        if (this.ddVisibleToFalseTO) { clearTimeout(this.ddVisibleToFalseTO) };
        this.setState({ animationClass: false });
        this.ddVisibleToFalseTO = setTimeout(() => {
            !this.state.animationClass &&
                this.setState({ ddVisible: false })
        }, 1000)
    }

    render() {

        let firstIndex = 0;
        let monthDD = this.monthNames.length < 2 ? []
            : this.monthNames.map((monthName, index) => {
                if (index === 0 && this.selectedMonth === this.monthNumbers[index]) { firstIndex = 1; return null; } //remove first statement for the selected month to not appear
                return (
                    <div key={monthName} >
                        {index !== firstIndex && < Divider />}
                        <ListItem button onClick={() => { this.handleMonthClick(monthName, index) }} >
                            <ListItemText primary={monthName} />
                        </ListItem>
                    </div>
                )
            });

        return <div id="myActivity-container">
            {/* The month selector which is the sticky component */}
            <div id="myActivity-txtAndDD" className="d-flex align-items-center justify-content-between">
                <div className="d-flex justify-content-center"><strong>{this.props.t("greetings.my_activity")}</strong></div>

                <div onBlur={this.handleOutsideClick} ref={node => { this.node = node; }} id="dropdown-container" className="pointer" >

                    <div className="d-flex align-items-center justify-content-center" id="dd-btn-container" onClick={() => { this.handleDDClick() }} >

                        <button className="dd-btn" >{this.monthForDDTitle}</button>
                        {monthDD.length ? <ArrowDropDownIcon id="arrow" /> : null}

                    </div>
                    {/* this.state.ddVisible &&  */monthDD.length ?
                        <div className={(this.state.animationClass ? "scale-in-animation" : "scale-out-animation") + (this.state.ddVisible ? "" : " display-none")} id="month-dropdown-container" >
                            <List id="class-summary-list" component="nav" aria-labelledby="nested-list-subheader" className="root" >
                                {monthDD}
                            </List>
                        </div>
                        : null}

                </div>

            </div>
            {/* the list of good points by month */}
            <div id="GpByMonth">
                <GPByMonth month={this.selectedMonth} handleGPsScroll={this.props.handleGPsScroll} endMsgClass={this.props.endMsgClass} consts={this.props.consts} />
            </div>
        </div >
    }
}

export default withContext({ consts: ConstsContext })(translate(inject("GoodPointsStore")(observer(MyActivity))));
