import React, { useMemo, useEffect } from 'react';
import { inject, observer } from 'mobx-react'

import { Search as SearchIcon, FilterList as FilterListIcon } from '@material-ui/icons';

import ClassesUtils from './ClassesUtils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { handleTableContainerScroll } from '../scenes/admin'

import consts, { regexes } from '../consts/consts'

import classesUtils from './ClassesUtils'

import { AdminDD } from '../generic-components/admin-dropdown'
import './CSS/admin_classes_table.scss'
import { useTranslate } from '../translation/GPi18n';
import { useOpenPopups } from '../contexts/openPopupsContext';
import { useConsts } from '../contexts/constsContext';


let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms
const GRADES_DD = 1;
const CLASSES_DD = 2;


const AdminClassesTable = (props) => {

    const { t, i18n } = useTranslate();
    const { GET_HEBREW_GRADES } = useConsts();
    const defaultFilterValues = { [GRADES_DD]: { value: "", name: t("send_gp.all_grades") }, [CLASSES_DD]: { value: "", name: t("send_gp.all_classes") } };
    const [filterOptions, setFilterOptions] = React.useState(false)
    const [showMoreFilters, setShowMoreFilters] = React.useState(false) // toggle more filters with more-filters-icon
    const [openDDFilters, setOpenDDFilters] = React.useState(null); // grades and class index drop down filters
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time
    const [selectedFiltersValue, setFiltersValue] = React.useState(defaultFilterValues);

    const [searchVal, setSearchVal] = React.useState('');

    const { openPopups } = useOpenPopups();

    useEffect(() => {
        const appEl = document.getElementById('app').addEventListener('scroll', handleClassesScroll);
        return () => { //will unmount
            try { appEl.removeEventListener('scroll', handleClassesScroll) } catch (e) { }
        }
    }, [])

    const classes = props.StudentsStore.getAdminClassesList;

    let classesTDs = classes;
    const gradesTrans = useMemo(() => { return GET_HEBREW_GRADES }, [i18n.language])
    if (!classes) classesTDs = t("loading")
    else if (typeof classes !== "string")
        classesTDs = !classes.length ? t("errors.not_found") + " " + t("classes") : classes.map((c, index, classesArr) => {
            const newGrade = classesArr[index + 1] && classesArr[index + 1].grade > c.grade;

            return <tr key={"k" + c.id} className={newGrade ? "new-grade-underline" : ""}>
                <td> {gradesTrans[c.grade - 1]}</td>
                <td> {c.classIndex}</td>
                <td> {`${c.Teacher && c.Teacher.firstName && c.Teacher.lastName ? c.Teacher.firstName + " " + c.Teacher.lastName : '---'}`}</td>
                <td className="flex-row-evenly" >
                    <FontAwesomeIcon onClick={() => { handleEdit(c) }} title={t("admin.classes.edit_class")} className="to-be-disabled admin-icon-hover admin-icon" icon="pencil-alt" />
                    <FontAwesomeIcon onClick={() => { handleDelete(c) }} title={t("admin.classes.delete_class")} className="to-be-disabled admin-icon-hover admin-icon" icon="trash-alt" />
                </td>
            </tr>
        })



    const getGrades = () => {
        let gradesTrans = GET_HEBREW_GRADES // grades change
        const gradesOptions = gradesTrans.map((g, i) => ({ key: "k" + i, value: g, name: g }));
        gradesOptions.unshift({ key: "k" + gradesTrans.length, value: "", name: t("send_gp.all_grades") })
        return gradesOptions;
    }
    const getClassIndexes = () => {
        let classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const classesOptions = classes.map((c, i) => ({ key: "k" + i, value: c, name: c }));
        classesOptions.unshift({ key: "k" + classes.length, value: "", name: t("send_gp.all_classes") })
        return classesOptions;
    }

    const handleFilterGradeChange = (item) => {
        setFiltersValue(vals => ({ ...vals, [GRADES_DD]: item }))
        props.StudentsStore.setAdminClassesGradeFilter(item.value);
    }
    const handleFilterClassIndexChange = (item) => {
        setFiltersValue(vals => ({ ...vals, [CLASSES_DD]: item }))
        props.StudentsStore.setAdminClassesClassIndexFilter(String(item.value));
    }
    const handleTeacherSearchChange = (e) => {
        let value = e && e.target ? e.target.value : (e && e.currentTarget ? e.currentTarget.value : '') //syntheticError ?!
        if (!(regexes.FIRST_LAST_NAME.test(value)) && value !== "") return;
        setSearchVal(value)

        let teacherFilter = value.split('\'')
        teacherFilter = teacherFilter.length > 1 ? teacherFilter.join("\\'") : teacherFilter.join('') // add a backslash b4 ' for regex syntax
        teacherFilter = teacherFilter.split('"')
        teacherFilter = teacherFilter.length > 1 ? teacherFilter.join('\\"') : teacherFilter.join('') // add a backslash b4 " for regex syntax

        props.StudentsStore.setAdminClassesNameFilter(teacherFilter);
    }

    const handleEdit = clas => {
        openPopups(clas, 'CLASS_EDIT', [null, null, null], true)
    }

    const handleDelete = (clas) => {
        openPopups(`${t("pop_up.delete_class")} ${gradesTrans[clas.grade - 1]} ${clas.classIndex}?`, 'ERROR', [t("delete"), t("cancel"), (toDelete) => {
            toDelete && props.StudentsStore.toDeleteClass(clas.id, handleDeleteErr)
        }]);
    }

    const handleDeleteErr = error => {
        if (!error) return;
        openPopups(error, 'ERROR', [null, null, null], true)
    }
    const handleClassesScroll = e => {
        const atBottom = handleTableContainerScroll(e)
        if (atBottom) {
            props.StudentsStore.handleAdminClassesScroll();
        }
    }


    const handleDDClick = (ddType) => () => {
        clearTimeout(ddTO);
        setOpenDDFilters(v => v ? !v : ddType);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleDDBlur = () => {
        if (!openDDFilters) return;
        clearTimeout(ddTO);
        setOpenDDFilters(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }


    return (
        <>
            <div id="admin-classes-filter-container" className="top-table-container">
                <div className="table-name">{t("classes")}</div>
                <div className={`filter-container ${showMoreFilters ? "more-filters-open" : "more-filters-close"}`}>
                    <div className="first-filters-container">

                        <div className="name-search" > {/* search for a name + "more-filters" icon */}
                            <input
                                className="search"
                                placeholder={t("search")}
                                id="admin-classes-search-input-3920vk"
                                value={searchVal}
                                onChange={handleTeacherSearchChange}
                            />
                            <label htmlFor="admin-classes-search-input-3920vk">
                                <img className="search-icon" src="/images/admin_search.svg" />
                            </label>
                        </div>

                        <FilterListIcon
                            onClick={() => { props.StudentsStore.resetAdminClassesFilters(); setFiltersValue(defaultFilterValues); setShowMoreFilters(v => !v) }}
                            className="more-filters-icon"
                        />
                    </div>
                    <div className="more-filters-container">
                        <AdminDD
                            showDDItems={openDDFilters ? openDDFilters === GRADES_DD : openDDFilters}
                            handleDDBlur={handleDDBlur}
                            handleDDClick={handleDDClick(GRADES_DD)}
                            ddItems={getGrades()}
                            selectedItem={selectedFiltersValue[GRADES_DD] || ""}
                            handleItemclick={handleFilterGradeChange}
                            arrowAnimation={arrowAnimation}
                        />
                        <AdminDD
                            showDDItems={openDDFilters ? openDDFilters === CLASSES_DD : openDDFilters}
                            handleDDBlur={handleDDBlur}
                            handleDDClick={handleDDClick(CLASSES_DD)}
                            ddItems={getClassIndexes()}
                            selectedItem={selectedFiltersValue[CLASSES_DD] || ""}
                            handleItemclick={handleFilterClassIndexChange}
                            arrowAnimation={arrowAnimation}
                        />
                    </div>

                </div>
            </div>
            <div id="classes-table" className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t("admin.classes.class_age")}</th>
                            <th>{t("admin.classes.number")}</th>
                            <th>{t("admin.home_teacher_male_or_female")}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {typeof classesTDs === "string" ? null : classesTDs}
                    </tbody>
                </table>
                {typeof classesTDs === "string" ? <div className="no-table-data">{classesTDs}</div> : null}
            </div>
        </>
    );
}

export default inject("StudentsStore")(observer(AdminClassesTable));;
