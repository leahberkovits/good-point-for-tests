import React from 'react';
import { inject, observer } from 'mobx-react'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import SortOptions from '../consts/SortStudentsOptions'

import './CSS/search_students_in_class_summary.scss'

class SearchStudentsInClassSummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ddVisible: false,
            animationClass: false
        }
        this.ddVisibleToFalseTO = null;
    }

    handleSortClick = (sort) => {
        this.props.StudentsStore.sort = sort;
        this.closeDD()
    }

    handleDDClick = () => {
        if (this.ddVisibleToFalseTO !== null) { clearTimeout(this.ddVisibleToFalseTO) };
        if (this.state.animationClass) {
            this.closeDD()
        } else { //gonna open
            this.setState({ animationClass: true, ddVisible: true });
            document.addEventListener('click', this.handleOutsideClick, false);
        }
        return;

        if (!this.state.ddVisible) { //gonna open
            document.addEventListener('click', this.handleOutsideClick, false);
            this.setState({ animationClass: true, ddVisible: true });
        } else {
            setTimeout(() => { this.setState({ ddVisible: false }) }, 1000)
            this.setState({ animationClass: false });
            document.removeEventListener('click', this.handleOutsideClick, false);
        }
    }

    closeDD = () => {
        this.setState({ animationClass: false });
        document.removeEventListener('click', this.handleDDClick, false)

        this.ddVisibleToFalseTO = setTimeout(() => {
            this.setState({ ddVisible: false })
        }, 1000)
        //if prob with dd --> this is the outside click event
    }
    handleOutsideClick = (e) => {
        // ignore clicks on the component itself
        try {
            if (!this.node.contains(e.target)) {
                this.closeDD()
            }
        } catch (err) {
            document.removeEventListener('click', this.handleOutsideClick, false);
        }
    }

    render() {
        return (<div id="class-summary-dropdown-container">
            <div ref={node => { this.node = node; }} className="row align-items-center justify-content-between" id="dropdownBtn" onClick={() => { this.handleDDClick() }} >
                <div id="sort-btn" >{t("show_by")}</div>

                <img src="/images/arrow-dd.png" id="arrow" />
            </div>
            {this.state.ddVisible && <div className={this.state.animationClass ? "scale-in-animation" : "scale-out-animation"} ><List id="class-summary-list" component="nav" aria-labelledby="nested-list-subheader" className="root" >
                <ListItem button onClick={() => { this.handleSortClick(SortOptions.ALPHABETIC_SORT) }}>
                    <ListItemText primary={this.props.t("primary")} />
                </ListItem>
                <Divider />
                <ListItem button onClick={() => { this.handleSortClick(SortOptions.GP_SUM_SORT) }}>
                    <ListItemText primary={this.props.t("number_of_points")} />
                </ListItem>
            </List></div>
            }
        </div>);
    }
}

export default inject("StudentsStore")(observer(SearchStudentsInClassSummary));