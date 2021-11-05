import React, { useMemo } from 'react';
import { inject, observer } from 'mobx-react'

import { Grid } from '@material-ui/core';

import ClassesUtils from './ClassesUtils';

import consts from '../consts/consts'



import './CSS/print_students.scss'
import { useTranslate } from '../translation/GPi18n';
import { useConsts } from '../contexts/constsContext';




function PrintStudents(props) {
    const { t, i18n } = useTranslate();
    const { GET_HEBREW_GRADES } = useConsts();

    const grades = useMemo(() => { return GET_HEBREW_GRADES }, [i18n.language]);
    let students = props.StudentsStore.filteredStudents;

    if (!students || students === null /* || props.StudentsStore.currentlyFetching */) return <div> {t("loading")} </div>;

    if (!students.length) return <div id="no-students-need-margin-top" >{`${t("errors.not_found")} ${t("students")}`}</div>

    if (typeof students === "string") return <div id="no-students-need-margin-top" >{students}</div>;


    const handleStudentsScroll = (e) => {
        const sListEl = e.target

        props.GoodPointsStore.setStudentsListScrollPos(sListEl.scrollTop)

        if (sListEl.scrollTop >= (sListEl.scrollHeight - sListEl.offsetHeight - 2))
            props.StudentsStore.handleSendAGPStudentsScroll();
        sListEl.scrollTop > 100 ? props.setScrollUpButton(true) : props.setScrollUpButton(false)
    }


    const handleStudentClick = student => {
        props.GoodPointsStore.student({ "studentFirstName": student.firstName, "studentLastName": student.lastName, "studentId": student.id, "studentGender": student.gender, "classIndex": student.Class.classIndex, "grade": student.Class.grade })
        props.changeUrl("/write-a-good-point");
        props.GoodPointsStore.chatBackTo = "/send-a-good-point";
        props.StudentsStore.setStudentsFilter(consts.NO_STUDENTS_FILTER);
        props.StudentsStore.grade = consts.NO_CLASS_FILTER;
        props.StudentsStore.index = consts.NO_CLASS_FILTER;
    }

    students = students.sort((a, b) => (a.gpCount > b.gpCount ? 1 : (a.gpCount < b.gpCount ? -1 : ((a.firstName < b.firstName) ? -1 : (a.firstName > b.firstName) ? 1 : ((a.lastName < b.lastName) ? -1 : (a.lastName > b.lastName) ? 1 : 0)))))
    // students = students.sort((a, b) => )
    students = students.map((student, i) => {
        let teacherGender = (student.Class.Teacher.gender ? ((student.Class.Teacher.gender.toLowerCase() === 'male') ? t("send_gp.male_Hteacher") : t("send_gp.female_Hteacher")) : null);
        return <div id="student-container" className="pointer" style={{ animationDelay: i / 13 + "s" }} key={student.id}>
            <Grid key={student.id} container spacing={1}
                onClick={() => { handleStudentClick(student) }} >

                <Grid item xs={2} >
                    <img src="/images/userIcon.png" id="studentIcon" alt="students icon" />
                </Grid>

                <Grid container xs={8} id="names-container"  > {/* need the xs even tho throws error */}

                    <Grid item xs={12} > <div className="studentList-text" id="student-name" spellCheck="false" >{student.firstName + " " + student.lastName}</div> </Grid>
                    <Grid item xs={12} > <div className="studentList-text" id="teacher-name" spellCheck="false">{`${student.Class.Teacher.firstName && teacherGender ? student.Class.Teacher.firstName + " " + teacherGender : t("send_gp.no_teacher")} ${grades[student.Class.grade - 1]}' ${student.Class.classIndex}`}</div> </Grid>

                </Grid>

                <Grid item xs={1} > <div id="gpCountSendGp" className="studentList-text">{student.gpCount > 0 && student.gpCount}</div> </Grid> {/* when zero, will show nothing */}
                <Grid item xs={1} id="heartImgContainer"> <img id="heartImg" src="/images/heart.png" alt="logo img" /> </Grid>

            </Grid>
            <div id="hr-padding">

                <hr />
            </div>
        </div>
    }) // map end

    let hasMoreStudents = props.StudentsStore.hasMoreStudents;

    return <div onScroll={handleStudentsScroll} ref={props.studentsListRef} id="scrollable-student-container" className="slide-in-bottom2" >
        {students}
        <p>{hasMoreStudents ? t("loading") : null}</p>
    </div>


}

export default inject("StudentsStore", "GoodPointsStore")(observer(PrintStudents));
