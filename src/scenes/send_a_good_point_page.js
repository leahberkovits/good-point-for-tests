import React, { useEffect, useRef, useState } from 'react';
import { observer, inject } from "mobx-react"

import Top from '../components/top'
import SearchStudent from '../components/search_student'
import PrintStudents from '../components/print_students'
import ClassesUtils from '../components/ClassesUtils';
import ScrollBackUp from '../components/scroll_button';

import consts from '../consts/consts'
import utils from '../components/functionUtils'

import '../components/CSS/PagesCSS/send_a_good_point_page.scss'
import { useTranslate } from '../translation/GPi18n';

function SendAGoodPointPage(props) {
    const { t } = useTranslate()
    const studentsListRef = useRef()
    let { studentsListScrollPos, setStudentsListScrollPos } = props.GoodPointsStore

    const [scrollUpButton, setScrollUpButton] = React.useState(false)

    props.GoodPointsStore.selectedStudent = null;

    useEffect(() => {
        props.StudentsStore.setStudentsFilter(consts.NO_STUDENTS_FILTER);
        props.StudentsStore.grade = consts.NO_CLASS_FILTER;
        props.StudentsStore.index = consts.NO_CLASS_FILTER;
        ClassesUtils.fetchClasses(); //so won't be weird on dd open

        handleScrollToPrevPos()

    }, [])

    const handleScrollToPrevPos = () => {
        if (props.GoodPointsStore.scrollStudentsListQuestionMark && Number(studentsListScrollPos) > 10 && studentsListRef && studentsListRef.current && typeof studentsListRef.current.scrollTo === "function") {
            try { studentsListRef.current.scrollTo({ top: studentsListScrollPos }) } catch (e) { }
        }
    }

    const handleScrollUpButtonChange = newVal => {
        if (typeof newVal !== "boolean")
            return;
        if (newVal && !scrollUpButton)
            setScrollUpButton(true)
        else if (!newVal && scrollUpButton)
            setScrollUpButton(false)

    }

    const changeUrl = url => {
        props.history.push(url);
    }

    return <div id="send-a-good-point-page">
        <Top home={true} text={t("send_gp.sending_gp")} />
        <SearchStudent />
        <PrintStudents studentsListRef={studentsListRef} changeUrl={changeUrl} setScrollUpButton={handleScrollUpButtonChange} />
        {scrollUpButton ? <ScrollBackUp id="up-button" icon={'arrow-up'} elem={document.getElementById('scrollable-student-container')} x={0} y={0} /> : null}
    </div>
}

export default inject("StudentsStore", "GoodPointsStore")(observer(SendAGoodPointPage));