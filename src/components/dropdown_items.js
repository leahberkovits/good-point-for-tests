import React from 'react';
import { inject, observer } from 'mobx-react'
import './CSS/dropdown_items.scss'

import consts from '../consts/consts'
import ClassesUtils from './ClassesUtils';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import { translate } from '../translation/GPi18n';
import { classNumbers } from '../contexts/constsContext';
class DropdownItems extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openArr: Array(this.props.StudentsStore.getHebrewGrades && this.props.StudentsStore.getHebrewGrades.length || classNumbers.length).fill(false) // grades change
        };
        this.classIndexes = '';
    }

    handleGradeClick = (id, grade) => {
        if (grade === this.props.t("send_gp.all_classes")) this.props.handleClassSelect(this.props.t("send_gp.all_classes"));
        else this.getClassIndexes(grade);

        // updates the state arr of the open so only the selected list item is true
        let openArr = this.state.openArr;
        let bool = openArr[id];
        for (let i = 0; i < openArr.length; i++) { openArr[i] = false; }
        openArr[id] = !bool;
        this.setState({ openArr })
    }

    handleClassClick = (clss) => {
        if (!clss) {
            this.props.StudentsStore.grade = consts.NO_CLASS_FILTER;
            this.props.StudentsStore.index = consts.NO_CLASS_FILTER;
        } else {
            let arrClass = clss.split(" ");
            this.props.StudentsStore.grade = arrClass[0];
            this.props.StudentsStore.index = arrClass[1];
        }

        let classNameForTitle = this.props.t("send_gp.all_classes")
        clss && (classNameForTitle = this.props.t("class") + " " + clss)

        this.props.handleClassSelect(classNameForTitle)
        /* will close open indexes from the last DD list click */
        this.setState({ openArr: Array(this.props.StudentsStore.getHebrewGrades && this.props.StudentsStore.getHebrewGrades.length || consts.GET_HEBREW_GRADES.length).fill(false) }) // grades change
    }

    getClassIndexes = (grade) => {
        let classes = ClassesUtils.collapseClassList(grade);
        // classes has the right way of displaying the classes in the DD list
        classes = classes.map((clss) => <ListItem key={clss} button onClick={() => { this.handleClassClick(clss) }} ><ListItemText primary={this.props.t("class") + " " + clss} className="nested" /></ListItem>);
        this.classIndexes = classes;
    }
    getGrades = () => {
        let grades = this.props.StudentsStore.getHebrewGrades;
        if (!grades || (grades && !grades.length)) {
            return;
        }
        grades = grades.map((grade, index) => {
            return <div key={grade} >
                <ListItem button onClick={() => { this.handleGradeClick(index + 1, grade) }}>
                    <ListItemText primary={this.props.t("class") + " " + grade} />
                    {this.state.openArr[index + 1] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                {this.classIndexes && (<Collapse in={this.state.openArr[index + 1]} timeout="auto">
                    <List component="div" disablePadding>
                        {this.classIndexes}
                    </List>
                </Collapse>)}
            </div>
        });
        return grades;
    }

    render() {
        let listClassName = this.props.animationClass ? "root scale-in-animation" : "root scale-out-animation";
        return (
            <List ref={this.props.classesRef} id="list" component="nav" aria-labelledby="nested-list-subheader" className={listClassName} >
                <ListItem button onClick={() => { this.handleClassClick(false) }}>
                    <ListItemText primary={this.props.t("send_gp.all_classes")} />
                </ListItem>
                <Divider />
                {this.getGrades()}
            </List>
        );

    }
}

export default translate(inject("StudentsStore")(observer(DropdownItems)));
