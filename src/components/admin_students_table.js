import React, { useEffect, useMemo } from 'react';
import { inject, observer } from 'mobx-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FilterList as FilterListIcon } from '@material-ui/icons';
import { Checkbox, IconButton, Tooltip } from '@material-ui/core';
import IndeterminateCheckBox from '@material-ui/icons/IndeterminateCheckBox';

import { handleTableContainerScroll } from '../scenes/admin'
import { AdminDD } from '../generic-components/admin-dropdown';

import consts, { regexes } from '../consts/consts'
import classesUtils from './ClassesUtils'
import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'
import { convertStudentGenderToHeb } from '../consts/GenderOptionsLowerCased';

import '../components/CSS/admin_students_table.scss'
import { useTranslate } from '../translation/GPi18n';
import { useOpenPopups } from '../contexts/openPopupsContext';
import { useConsts } from '../contexts/constsContext';



let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms

const GRADES_DD = 1
const CLASSES_DD = 2
const STUDENTS_DD = 3


const AdminStudentsTable = (props) => {
    const { t } = useTranslate();
    const { ADMIN_STUDENTS_ALL, ADMIN_STUDENTS_FLOATING, GET_HEBREW_GRADES, HEBREW_ENGLISH_GRADES } = useConsts()
    const StudentsFloatingFilterItems = [
        { key: "k0", name: t("admin.all_students"), value: ADMIN_STUDENTS_ALL },
        { key: "k1", name: t("admin.missing_class_students"), value: ADMIN_STUDENTS_FLOATING },
    ];
    const defaultFilterValues = {
        [CLASSES_DD]: { value: "", name: t("send_gp.all_classes") },
        [GRADES_DD]: { value: "", name: t("send_gp.all_grades") },
        [STUDENTS_DD]: { value: "", name: t("admin.all_students") }
    };

    const [showMoreFilters, setShowMoreFilters] = props.StudentsStore.useStudentsShowMoreFilters // toggle more filters with more-filters-icon
    // ^ changed from useState to mobx, so another component can use this value
    const [openDDFilters, setOpenDDFilters] = React.useState(null); // grades, class index or students/floating drop down filters

    const [selectedFilterValues, setSelectedFilterValues] = React.useState(defaultFilterValues);
    const [arrowAnimation, setArrowAnimation] = React.useState({}); // otherwise the arrow animation happens only the first time
    const [searchVal, setSearchVal] = React.useState('');

    const { openPopups } = useOpenPopups();

    // let showAllStudents = props.StudentsStore.adminShowAllStudents

    useEffect(() => {
        const appEl = document.getElementById('app').addEventListener('scroll', handleAdminScroll);
        return () => { //will unmount
            props.StudentsStore.resetAdminStudentsFilters()
            props.StudentsStore.setAdminShowAllStudents(consts.ADMIN_STUDENTS_ALL)
            try { appEl.removeEventListener('scroll', handleAdminScroll) } catch (e) { }
        }
    }, [])


    let isSelected;
    let studentsTD = useMemo(() => {
        const students = props.StudentsStore.getAdminStudentsList;
        let grades = GET_HEBREW_GRADES // grades change
        if (!students) return t("loading")

        else if (typeof students !== "string")
            return !students.length ? t("no_info")
                : students.map(s => {
                    if (!s.id) return null;
                    isSelected = props.StudentsStore.getCheckedAdminStudents.includes(s.id);
                    return <tr className={isSelected ? "selcted-student" : ""} key={s.id} >
                        <td><Checkbox color="default" onClick={() => { handleStudentCheck(s.id) }} checked={isSelected} /></td>
                        <td>{s.firstName + " " + s.lastName}</td>
                        <td>{typeof s.gender === "string" ? convertStudentGenderToHeb[s.gender.toLowerCase()] : t("genders.male")}</td>
                        <td>{s.Class && s.Class.grade && s.Class.classIndex ? `${grades[s.Class.grade - 1]} ${s.Class.classIndex}` : '---'}</td>
                        <td>{s.phoneNumber1 || ""}</td>
                        <td>{s.phoneNumber2 || ""}</td>
                        <td className="flex-row-evenly" >
                            <FontAwesomeIcon onClick={() => { handleEdit(s) }} title={(typeof s.gender === "string" && s.gender.toLowerCase() === GenderOptionsLowerCased.FEMALE ? t("admin.students.edit_female") : t("admin.students.edit_male"))} className="to-be-disabled admin-icon-hover admin-icon" icon="pencil-alt" />
                            <FontAwesomeIcon onClick={() => { handleDelete(s) }} className="to-be-disabled admin-icon" title={typeof s.gender === "string" && s.gender.toLowerCase() === GenderOptionsLowerCased.FEMALE ? t("admin.students.delete_female") : t("admin.students.delete_male")} icon="trash-alt" />
                        </td>
                    </tr>

                })
    }, [props.StudentsStore.getAdminStudentsList, props.StudentsStore.selectedAdminStudents])

    const handleStudentCheck = (i) => {
        props.StudentsStore.handleAdminStudentsCheck(i);
    }

    const getGrades = () => {
        let grades = GET_HEBREW_GRADES // grades change
        const gradesOptions = grades.map((g, i) => ({ key: "k" + i, value: g, name: g }));
        gradesOptions.unshift({ key: "k" + grades.length, value: "", name: t("send_gp.all_grades") })
        return gradesOptions;
    }
    const getClassIndexes = () => {
        let classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const classesOptions = classes.map((c, i) => ({ key: "k" + i, value: c, name: c }));
        classesOptions.unshift({ key: "k" + classes.length, value: "", name: t("send_gp.all_classes") })
        return classesOptions;
    }

    const handleFilterGradeChange = (item) => {
        setSelectedFilterValues(vals => ({ ...vals, [GRADES_DD]: item }))
        props.StudentsStore.setAdminGradeFilter(item.value);
    }
    const handleFilterClassIndexChange = (item) => {
        setSelectedFilterValues(vals => ({ ...vals, [CLASSES_DD]: item }))
        props.StudentsStore.setAdminClassIndexFilter(String(item.value));
    }
    const handleStudentsFloatingFilterChange = (item) => {
        setSelectedFilterValues(vals => ({ ...vals, [STUDENTS_DD]: item }))
        props.StudentsStore.setAdminShowAllStudents(item.value);
    }
    const handleStudentsSearchChange = (e) => {
        let value = e && e.target ? e.target.value : (e && e.currentTarget ? e.currentTarget.value : '') //syntheticError ?!
        if (!(regexes.FIRST_LAST_NAME.test(value)) && value !== "") return;
        setSearchVal(value)
        let studentsFilter = value.split('\'')
        studentsFilter = studentsFilter.length > 1 ? studentsFilter.join("\\'") : studentsFilter.join('') // add a backslash b4 ' for regex syntax
        studentsFilter = studentsFilter.split('\"')
        studentsFilter = studentsFilter.length > 1 ? studentsFilter.join('\\"') : studentsFilter.join('') // add a backslash b4 " for regex syntax

        props.StudentsStore.setAdminNameFilter(studentsFilter);
    }


    const handleEdit = student => {
        openPopups(student, 'STUDENT_EDIT', [null, null, null], true)
    }


    const handleDelete = student => {
        const areUSureText = Array.isArray(student) ? `${t("alerts.irreversible_action")} ${student.length > 1 ? t("the_students") : t("the_student")}?` : `${t("delete_generic")} ${student.firstName} ${student.lastName}?`
        openPopups(areUSureText, 'ERROR', [t("delete"), t("cancel"), (toDelete) => {
            toDelete && props.StudentsStore.toDeleteStudent(Array.isArray(student) ? student : student.id)
        }], true);
    }

    const handleUpdateClass = students => {
        const text = `${t("question.which_class")} ${students.length > 1 ? t("chosen_students") : t("chosen_student")}?`
        openPopups(text, 'UPDATE_CLASS', [newClass => { handleNewClassSelect(students, newClass) }]);
    }
    const handleNewClassSelect = (studentsIds, newClass) => {
        if (!newClass || newClass === "") {
            openPopups(null, null)
            return;
        }
        if (typeof newClass !== "string") {
            openPopups(t('alerts.internal_error'), 'ERROR', [null, null, null], true)
            return;
        }
        let [grade, classIndex] = newClass.split(" ");
        if (!grade || !classIndex || !Object.keys(HEBREW_ENGLISH_GRADES).includes(grade) || classIndex > 15 || classIndex < 1) { // grades change
            openPopups(t("admin.error_try_again"), 'ERROR', [null, null, null], true)
            return;
        }
        grade = classesUtils.englishGradesObj[grade]
        newClass && props.StudentsStore.updateMultStudentsClass(studentsIds, { grade, classIndex }, error => {
            if (error && typeof error === "string") {
                openPopups(error, 'ERROR', [null, null, null], true)
                return;
            }
            openPopups(null, null)
        })
    }

    const handleDeselect = () => {
        props.StudentsStore.deselectAdminStudents()
    }

    const handleAdminScroll = (e) => {
        const atBottom = handleTableContainerScroll(e)
        if (atBottom) {
            props.StudentsStore.adminFetchMoreStudentsOnSCroll();
        }
    }

    const handleDDClick = (ddType) => () => {
        clearTimeout(ddTO);
        setOpenDDFilters(v => v ? !v : ddType);
        setArrowAnimation({ [ddType]: true });
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleDDBlur = (ddType) => () => {
        if (!openDDFilters) return;
        clearTimeout(ddTO);
        setOpenDDFilters(false);
        setArrowAnimation({ [ddType]: true });
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    return (
        <>
            <div id="admin-points-filter-container" className="top-table-container">
                <div className="table-name">{t("students")}</div>
                <div className={`filter-container ${showMoreFilters ? "more-filters-open" : "more-filters-close"}`}>

                    <div className="first-filters-container">

                        <div className="name-search" > {/* search for a name + "more-filters" icon */}
                            <input
                                className="search"
                                placeholder={t("search")}
                                id="admin-students-search-input-3920vk"
                                value={searchVal}
                                onChange={handleStudentsSearchChange}
                            />
                            <label htmlFor="admin-students-search-input-3920vk">
                                <img className="search-icon" src="/images/admin_search.svg" />
                            </label>
                        </div>

                        <FilterListIcon
                            onClick={() => { props.StudentsStore.resetAdminStudentsFilters(); setSelectedFilterValues(defaultFilterValues); setShowMoreFilters(v => !v) }}
                            className="more-filters-icon"
                        />

                    </div>

                    <div className="more-filters-container">
                        <AdminDD
                            showDDItems={openDDFilters ? openDDFilters === STUDENTS_DD : openDDFilters}
                            handleDDBlur={handleDDBlur(STUDENTS_DD)}
                            handleDDClick={handleDDClick(STUDENTS_DD)}
                            ddItems={StudentsFloatingFilterItems}
                            selectedItem={selectedFilterValues[STUDENTS_DD] || ""}
                            handleItemclick={handleStudentsFloatingFilterChange}
                            arrowAnimation={arrowAnimation[STUDENTS_DD]}
                        />
                        <AdminDD
                            showDDItems={openDDFilters ? openDDFilters === GRADES_DD : openDDFilters}
                            handleDDBlur={handleDDBlur(GRADES_DD)}
                            handleDDClick={handleDDClick(GRADES_DD)}
                            ddItems={getGrades()}
                            selectedItem={selectedFilterValues[GRADES_DD] || ""}
                            handleItemclick={handleFilterGradeChange}
                            arrowAnimation={arrowAnimation[GRADES_DD]}
                        />
                        <AdminDD
                            showDDItems={openDDFilters ? openDDFilters === CLASSES_DD : openDDFilters}
                            onBlur={handleDDBlur(CLASSES_DD)}
                            handleDDClick={handleDDClick(CLASSES_DD)}
                            ddItems={getClassIndexes()}
                            selectedItem={selectedFilterValues[CLASSES_DD] || ""}
                            handleItemclick={handleFilterClassIndexChange}
                            arrowAnimation={arrowAnimation[CLASSES_DD]}
                        />
                    </div>

                </div>
            </div>

            <div className="admin-table-container" >

                <table className="admin-table" id="students-table">
                    <thead>
                        <tr>
                            <th>{props.StudentsStore.getCheckedAdminStudents && props.StudentsStore.getCheckedAdminStudents.length
                                ? <Tooltip title={t('cancel_choice')} enterDelay={100} enterNextDelay={300} ><IconButton id="deselect" onClick={handleDeselect} ><IndeterminateCheckBox /></IconButton></Tooltip>
                                : ""}</th>
                            <th>{t("admin.gps.students_name")}</th>
                            <th>{t("gender")}</th>
                            <th>{t("class")}</th>
                            <th>{t("admin.phone_p_1")}</th>
                            <th>{t("admin.phone_p_2")}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {typeof studentsTD === "string" ? null : studentsTD.map(s => s)}
                    </tbody>
                </table>
                {typeof studentsTD === "string" ? <div className="no-table-data">{studentsTD}</div> : null}
            </div>
        </>
    );

}

export default inject("StudentsStore")(observer(AdminStudentsTable));