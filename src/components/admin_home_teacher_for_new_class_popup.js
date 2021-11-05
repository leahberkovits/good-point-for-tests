import React, { useMemo } from 'react';
import { inject, observer } from 'mobx-react'

import { useTranslate } from '../translation/GPi18n';

import ClassesUtils from './ClassesUtils';
import { makeStyles } from '@material-ui/core';
import { Select } from '@material-ui/core';

import DarkBackgroundBehindPopup from '../components/dark_background_behind_popup'
import ErrorPopup from '../components/error_popup'


import './CSS/admin_home_teacher_for_new_class_popup.scss'
import { useConsts } from '../contexts/constsContext';

const useStyles = makeStyles(({
    root: { // admin-new-instance-input, order-dropdown
        backgroundColor: "#f0f1f6",
        color: "#666666",
        borderRadius: 15,
        minHeight: 40,
        height: "100%",
        minWidth: 120,
        width: "fit-content",
    },
    // root, select, filled, outlined, selectMenu, disabled, icon, iconOpen, iconFilled, iconOutlined, nativeInput,
    nativeInput: {
        paddingRight: 7, // not working!
    },
    select: {
        "&:focus": {
            borderBottom: "none",
            borderRadius: 15,//* on click will have a radius!!!!!
            backgroundColor: "#e5e6ea",
        }
    }
}));

const HomeTeacherForNewClassPopup = (props) => {
    const { t, i18n } = useTranslate();
    const { GET_HEBREW_GRADES } = useConsts();
    const classes = useStyles();

    const [teachersSelectVal, setTeachersSelectVal] = React.useState([]);
    const [popups, setPopups] = React.useState(null);

    const { teachersList, newClasses } = props; // gets it from admin_add_new_instance

    const noTeachersYet = !teachersList || teachersList.length < 2

    const uClassesInfo = useMemo(() => { // u is for unique (!) // todo check

        if (!noTeachersYet && newClasses && newClasses.length) {
            let filteredSameClass;
            let newUClassesInfo = [];
            for (let c of newClasses) {
                filteredSameClass = newUClassesInfo.filter(uc => uc.grade === c.grade && uc.classIndex === c.classIndex)
                if (filteredSameClass && !filteredSameClass.length) {
                    newUClassesInfo.push(c)
                }
            }
            return newUClassesInfo.sort((a, b) => a.grade > b.grade ? 1 : a.grade < b.grade ? -1 : (a.classIndex > b.classIndex ? 1 : (a.classIndex < b.classIndex ? -1 : 0)))
        } else return []
    }, [noTeachersYet, newClasses]);


    const handleTeacherSelectChange = (e, index) => {
        let newVals = Array.from(teachersSelectVal);
        newVals[index] = e.target.value;
        setTeachersSelectVal(newVals)
    }

    const getTeacherNames = () => {
        if (!teachersList || !Array.isArray(teachersList)) return [];

        let optionsArr = teachersList.map((t, i) => {
            return <option key={"k" + i + t.teacherFirstName} value={`${t.teacherFirstName} ${t.teacherLastName}`}>{`${t.teacherFirstName} ${t.teacherLastName}`}</option>
        })
        optionsArr.unshift(<option key={"k--999-novalue"} value='' />)
        return optionsArr;
    }

    const hadnleSubmit = () => {
        if (noTeachersYet) {
            props.openPopups(null, null)
            return;
        }
        const doneAssigning = teachersSelectVal && (teachersSelectVal.length == teachersSelects.length) && teachersSelectVal.every(t => t.length) //previously used to disable the "done" buttin (disabled={!noTeachersYet && !doneAssigning}) but then realized that it shouldn't be mandatory to assign home teacher to all classes cos maybe didn't add all teachers yet
        if (!doneAssigning) setPopups([<ErrorPopup text={t("admin.classes.before_save")} okayText={t("finish")} cancelText={t("keep_editing")} handlePopupClick={finished => {
            if (!finished) {
                setPopups(null)
                return;
            }
            assignTeachers()
        }} />, <DarkBackgroundBehindPopup key="k1" />])
        else assignTeachers()
    }

    const assignTeachers = () => {
        const assignedAll = teachersSelectVal && (teachersSelectVal.length == teachersSelects.length) && teachersSelectVal.every(t => t.length) //previously used to disable the "done" buttin (disabled={!noTeachersYet && !doneAssigning}) but then realized that it shouldn't be mandatory to assign home teacher to all classes cos maybe didn't add all teachers yet
        if (!assignedAll) { props.openPopups(null, null); return; }
        let newCls;
        const classesWHomeTeacher = uClassesInfo.map((cls, index) => {
            if (!teachersSelectVal[index])
                return null;
            newCls = { ...cls }
            newCls.firstName = teachersSelectVal[index].split(' ')[0]
            newCls.lastName = teachersSelectVal[index].split(' ')[1]
            return newCls;
        })
        props.openPopups(null, 'LOADING')
        props.StudentsStore.assignHomeTeacher(classesWHomeTeacher.filter(c => c), (err, timeo) => {
            props.openPopups(err, 'ERROR')
            if (timeo) {
                setTimeout(() => { props.openPopups(null, null) }, 2000)
            }
        })
    }
    const grades = useMemo(() => { return GET_HEBREW_GRADES }, [i18n.language]);
    const teachersSelects = noTeachersYet ? t("alerts.no_teachers") : uClassesInfo.map((c, index) => {
        return (
            <div key={"k" + grades[Number(c["grade"]) - 1] + c["classIndex"]} >
                <h5 className="home-teacher-title" >{t('admin.classes.class_age')}</h5>
                <h3 className="home-teacher-title" > {grades[Number(c["grade"]) - 1] || "?"}</h3>
                <h5 className="home-teacher-title" > {t("number_class")}</h5>
                <h3 className="home-teacher-title" > {c["classIndex"]}</h3>
                <h6>מה שמו של מחנך הכיתה?</h6>
                <div>
                    <Select
                        className="home-teacher-info-select"
                        native
                        value={teachersSelectVal[index] ? teachersSelectVal[index] : ''}
                        onChange={(e) => { handleTeacherSelectChange(e, index) }}
                        inputProps={{ id: 'home-teacher-name-select' }}
                        classes={classes}
                    >
                        {getTeacherNames()}
                    </Select>
                </div>
                <br />
            </div>
        );
    })

    return (
        <div>
            <div className="admin_popups" id="home-teacher-popup-container">
                <h3>{props.topMsg}</h3>
                <p>{props.msg}</p>
                <p>{` ${t("alerts.didn't_exist_now_they_do")} ${noTeachersYet ? teachersSelects : t("alerts.please_enter_teacher_names")}`}</p>
                {/* <p>* כיתות ללא מחנך לא יופיעו אצל המורים באפליקציה</p> */} {/* i don't think this is true */}
                <div id="teachersSelectes-container">
                    {!noTeachersYet ? teachersSelects : null}
                </div>
                <div id="home-teacher-submit" className="saveAdminForm" onClick={hadnleSubmit} >{noTeachersYet ? t("got_it") : t("finish")}</div>
                <div> {props.StudentsStore.assignHomeTeacherSuccess || typeof props.StudentsStore.assignHomeTeacherSuccess === "string" ? props.StudentsStore.assignHomeTeacherSuccess : null}</div>
            </div >
            {popups ? popups.map(p => p) : null}
        </div>
    );
}

export default inject("UsersStore", "StudentsStore")(observer(HomeTeacherForNewClassPopup));
