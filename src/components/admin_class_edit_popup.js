import { inject, observer } from 'mobx-react'
import React, { useMemo, useRef } from 'react';

import { useTranslate } from '../translation/GPi18n';

import { makeStyles } from '@material-ui/core';
import Select from '@material-ui/core/Select';

import ClassesUtils from './ClassesUtils';
import consts from '../consts/consts'
import { AdminDD } from '../generic-components/admin-dropdown';


import './CSS/admin_class_edit_popup.scss'
import { useConsts } from '../contexts/constsContext';

//! כשמטיריאל יו אי עובד, לא נוגעים!!!!!!!!
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



let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms
const GRADES_DD = 1;
const CLASSES_DD = 2;
const HOME_TEACHER_DD = 3;
const AdminClassEditPopup = (props) => {
    const { t, i18n } = useTranslate();
    const { GET_HEBREW_GRADES } = useConsts();
    let submitting = useRef(false).current;
    const classes = useStyles();

    const grade = useMemo(() => GET_HEBREW_GRADES[props.classInfo.grade - 1], [i18n.language])
    const classIndex = useMemo(() => props.classInfo.classIndex, [])

    const [vals, setVals] = React.useState(() => ({
        [GRADES_DD]: { value: Number(props.classInfo.grade), name: grade },
        [CLASSES_DD]: { value: props.classInfo.classIndex, name: props.classInfo.classIndex, key: "k0" }
    }))
    const [errs, setErrs] = React.useState({})

    const [openDDFilters, setOpenDDFilters] = React.useState(null); // grades and class index drop down filters
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time

    const errMessage = useMemo(() => errs?.general, [errs]);


    const getGrades = () => {
        let grades = GET_HEBREW_GRADES // grades change
        let engG, item;
        return grades.map((g, i) => {
            engG = ClassesUtils.convertToEnglishGrades(g);
            item = { key: "k" + i, value: Number(engG), name: g };
            if (Number(engG) === Number(grade)) {
                handleChange(item, GRADES_DD)
            }
            return item;
        });
    }

    const getClasses = () => {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((c, i) => ({ key: "k" + i, value: c, name: c }));
    }

    const getTeacherNames = () => {
        const teachersList = props.UsersStore.adminTeachersList
        if (!teachersList || !Array.isArray(teachersList)) return [];

        let teachersOptions = teachersList.map(t => {
            return <option key={t.teacherFirstName + t.teacherLastName} value={`${t.teacherFirstName}!${t.teacherLastName}`}>{`${t.teacherFirstName} ${t.teacherLastName}`}</option>
            //changed the way we identify the home teacher (for assignHomeTeacher and for classesUpdate) (added exclamation mark (!) between first and second name cos otherwise there is no way of knowing which is first and which is last (name) (! in future, could change it so we never connect the teacher's first name and last name !)
        });
        if (!props.classInfo.Teacher || !props.classInfo.Teacher.firstName || !props.classInfo.Teacher.lastName) // so default will b: ---
            teachersOptions.unshift(<option key="no-teacher-fdjskal" value='---' > --- </option>)
        return teachersOptions;
    }


    const handleChange = (item, ddType) => {
        setErrs({});
        setVals(v => ({ ...v, [ddType]: item }));
    }

    const handleDDClick = (ddType) => () => {
        clearTimeout(ddTO);
        setOpenDDFilters(v => v ? !v : ddType);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleDDBlur = (e) => {
        e.stopPropagation();

        if (!openDDFilters) return;
        clearTimeout(ddTO);
        setOpenDDFilters(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleSubmit = (vals) => {
        if (submitting) return
        submitting = true;
        let finalVals = {};
        console.log('finalVals: ', finalVals);
        if (vals[GRADES_DD] && Number(vals[GRADES_DD].value) !== Number(props.classInfo.grade)) {
            finalVals.grade = vals[GRADES_DD].value;
        }
        if (vals[CLASSES_DD] && Number(vals[CLASSES_DD].value) !== Number(classIndex)) {
            finalVals.classIndex = vals[CLASSES_DD].value;
        }
        if (vals[HOME_TEACHER_DD]) {
            finalVals.teacherName = vals[HOME_TEACHER_DD]
        }
        //only if got values and length for each values
        if (finalVals && typeof finalVals === "object" && Object.values(finalVals) && Object.values(finalVals).length && Object.values(finalVals).every(v => String(v).length)) {
            props.openPopups({ popup: "LOADING" })
            props.StudentsStore.updateClasses(finalVals, props.classInfo.id, [], (error) => {
                submitting = false;
                if (typeof error === "string")
                    props.openPopups({ popup: "ERROR", info: error, removePopupOnOutsideClick: true });
                else props.closePopups();
            });
        } else {
            props.closePopups();
            submitting = false;
        }
    }
    const selectedTeacherName = useMemo(() => typeof vals[HOME_TEACHER_DD] === "string" ? vals[HOME_TEACHER_DD] : props.classInfo.Teacher && props.classInfo.Teacher.firstName ? props.classInfo.Teacher.firstName + "!" + props.classInfo.Teacher.lastName : "---", [vals]);

    return (
        <div className="admin_popups admin-new-instance-signup-container" id="admin-class-edit-popup">
            <h6 className="new-instance-title new-class-title" >{`${t("admin.edit_something")} ${grade} ${classIndex}`}</h6>

            <div className='admin-new-class-form-container'>
                <div className="admin-new-instance-input" >
                    <div className="bold">{`${t("admin.classes.class_age")}:`}</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === GRADES_DD : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick(GRADES_DD)}
                        ddItems={getGrades()}
                        selectedItem={vals[GRADES_DD] || ""}
                        isError={errs[GRADES_DD] || null}
                        handleItemclick={(item) => { handleChange(item, GRADES_DD) }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-new-instance-dropdown-items"
                    />
                </div>
                <div className="admin-new-instance-input">
                    <div className="bold">{`${t("admin.classes.number")}:`}</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === CLASSES_DD : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick(CLASSES_DD)}
                        ddItems={getClasses()}
                        selectedItem={vals[CLASSES_DD] || ""}
                        isError={errs[CLASSES_DD] || null}
                        handleItemclick={(item) => { handleChange(item, CLASSES_DD) }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-new-instance-dropdown-items"
                    />
                </div>
            </div>
            <div className="admin-new-class-form-container admin-new-instance-input">
                <div className="bold">{t("admin.home_teacher_male_or_female")}</div>
                <Select
                    className="home-teacher-info-select"
                    value={selectedTeacherName}
                    native
                    onChange={(e) => { handleChange(e.target.value, HOME_TEACHER_DD) }}
                    // IconComponent={() => <img className="arrow-down" src="/images/admin-dd-arrow-down.svg" />}
                    classes={classes}
                // className={classes.root}
                >
                    {getTeacherNames()}
                </Select>
            </div>
            <div className="admin-new-class-form-container admin-new-instance-input admin-new-instance-errMessage">{errMessage}</div>
            <div className="new-instance-buttons-container">
                <button className="cancelAdminForm" onClick={() => { props.openPopups(null, null) }}> {t("cancel")} </button>
                <button className="saveAdminForm" onClick={() => { handleSubmit(vals) }}> {t("save")} </button>
            </div>

        </div >
    );
}

export default inject("StudentsStore", "UsersStore")(observer(AdminClassEditPopup));
