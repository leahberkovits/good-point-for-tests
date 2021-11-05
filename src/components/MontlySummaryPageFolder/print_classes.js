import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'
import { Grid, Table } from '@material-ui/core';
import { Link } from 'react-router-dom'
import ClassesUtils from '../ClassesUtils.js'
import Checkbox from '@material-ui/core/Checkbox';
import { PWA } from './../../components/pwa'
import { isIOS } from 'react-device-detect';

import '../CSS/classes_sum.scss'
import { useTranslate } from '../../translation/GPi18n.js';
import { useConsts } from '../../contexts/constsContext.jsx';

function PrintClasses(props) {
    const { t } = useTranslate();
    const { GET_HEBREW_GRADES } = useConsts();
    const [excelButtonAni, setExcelButtonAni] = React.useState(false)
    const cIdsPerGrade = {};
    const [isIos, setIsIos] = React.useState(false)

    useEffect(() => {
        // if (PWA.checkIfNotPWA(true) && isIOS) { //if(PWA.checkIfNotPWA(true))
        //     document.getElementById("classesSum-container").classList.add('inBrowserIOS')
        // } else if (PWA.checkIfNotPWA(true) && !isIOS) {
        //     document.getElementById("classesSum-container").classList.add('inBrowser')
        // }
        if (PWA.checkIfNotPWA(true) && isIOS) {
            setIsIos(true)
        } else {
            setIsIos(false)
        }
        return () => {
            props.GoodPointsStore.leaveSumPage();
        }
    }, [])

    const handleClassClick = (clas) => { //הנחיות עיצוב for now
        props.StudentsStore.selectedClassTeacher = { first: clas.teacherFirstName, last: clas.teacherLastName, gender: clas.teacherGender, gpSum: clas.gpSum };
        props.StudentsStore.gradeSelected = clas.grade;
        props.StudentsStore.indexSelected = clas.classIndex
        props.changeUrl('/class-monthly-summary');
    }

    const handleCheck = (e, i) => {
        props.GoodPointsStore.handleClassesForExcelCheck(e, i);
    }

    let firstClassOfGrade;
    let classes = props.StudentsStore.classes;
    if (!classes || classes === null) { classes = <div>{t("loading")}</div> }
    else if (Array.isArray(classes) && !classes.length) classes = `${t("errors.not_found")} ${t("classes")}`
    else if (typeof classes !== "string") {
        const grades = GET_HEBREW_GRADES;
        classes = classes.map((clas, index, classesArr) => {
            firstClassOfGrade = !classesArr[index - 1] || (classesArr[index - 1] && (JSON.stringify(classesArr[index - 1].grade) < JSON.stringify(clas.grade)))
            !cIdsPerGrade[clas.grade] ? cIdsPerGrade[clas.grade] = [clas.classId] : cIdsPerGrade[clas.grade].push(clas.classId)
            let hebGrade = grades[clas.grade - 1];
            let gpSum = clas.gpSum === 0 ? t("greetings.didnt_send") : (clas.gpSum === 1 ? t("greetings.one_s") : clas.gpSum + " " + t("greetings.x_gps"));
            //try to make the cIdsPerGrade arr work. otherwise make another function in store that gets the grade and adds all classIds that are in that grade
            return (
                <div id="classes-container" key={clas.id || "clsid" + index} >
                    {firstClassOfGrade ?
                        <div id="grade-header" onClick={e => handleCheck(e, cIdsPerGrade[clas.grade])} >{t("class_age") + " " + hebGrade}</div>
                        : null
                    }
                    <table onClick={e => handleCheck(e, clas.classId)} className="class-row" className="d-flex">
                        <tbody id="theTable">
                            <tr >
                                <td id="check-td" >
                                    <Checkbox
                                        label={clas} key={index}
                                        checked={props.GoodPointsStore.checkedValues.includes(clas.classId)}
                                    />
                                </td>
                                <td /* onClick={() => { handleClassClick(clas) }} commented out - בהתאם להנחיות העיצוב */ id="class-text-td" >
                                    <div id="class-text" >{t("class") + " " + hebGrade + clas.classIndex}</div>
                                </td>
                                <td /* onClick={() => { handleClassClick(clas) }} commented out - בהתאם להנחיות העיצוב */ id="gpCount-td" > {gpSum}</td>
                            </tr>
                        </tbody>
                    </table>
                    <hr className="light-hr" />
                </div >
            );
        });
    }

    let show = props.GoodPointsStore.displayExportButton;
    if (show && !excelButtonAni) {
        setExcelButtonAni(true);
    }
    if (!show && excelButtonAni) {
        setExcelButtonAni(false);
    }

    return <div id="classesSum-container" className={isIos ? (excelButtonAni ? "slide-down-animation-ios" : "slide-back-in-animation-ios") : (excelButtonAni ? "slide-down-animation" : "slide-back-in-animation")}>
        {classes}
    </div>

}

export default inject("StudentsStore", "GoodPointsStore")(observer(PrintClasses));
