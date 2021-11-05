import React from 'react';
import { inject, observer } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useTranslate } from '../translation/GPi18n';
import { useOpenPopups } from '../contexts/openPopupsContext';

import ClassesUtils from './ClassesUtils'
import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'

import './CSS/admin_teachers_table.scss'
import { useConsts } from '../contexts/constsContext';

const AdminTeachersTable = (props) => {
    const { t: trans } = useTranslate();
    const { GET_HEBREW_GRADES } = useConsts()
    const teachers = props.UsersStore.adminTeachersList;

    const { openPopups } = useOpenPopups();

    let teachersTDs = teachers;
    if (!teachers) teachersTDs = trans("loading");
    else if (typeof teachers !== "string") {
        const grades = GET_HEBREW_GRADES;
        teachersTDs = !teachers.length ? `${trans("errors.not_found")} ${trans("teachers")}` : teachers.map((t, i) => {
            return (
                <tr key={t.teacherFirstName + i} >
                    <td> {t.teacherFirstName} </td>
                    <td> {t.teacherLastName} </td>
                    <td> {t.classIndex && t.grade ? grades[t.grade - 1] + " " + t.classIndex : typeof t.teacherGender === "string" && t.teacherGender.toLowerCase() === GenderOptionsLowerCased.FEMALE ? trans("admin.teachers.not_female_teacher") : trans("admin.teachers.not_male_teacher")} </td>
                    <td>
                        <FontAwesomeIcon onClick={() => { handleEdit(t, i) }} title={trans("admin.teachers.edit")} className="admin-icon-hover admin-icon" icon="pencil-alt" />
                    </td>
                </tr >
            );
        })
    }

    const handleEdit = (teacher, index) => {
        openPopups(teacher, 'TEACHER_EDIT', [index, null, null], true)
    }


    return (
        <>
            <div id="admin-teachers-filter-container" className="top-table-container">
                <div className="table-name">{trans("admin.teachers.table_name")}</div>
                <div className="filter-container more-filters-close" >
                    <div className="first-filters-container">

                        <div className="name-search" > {/* search for a name */}
                            <input
                                className="search"
                                placeholder={trans("search")}
                                id="admin-teachers-search-input-3920vk"
                                value={props.UsersStore.adminTeachersListFilterVal || ""}
                                onChange={(e) => props.UsersStore.setAdminTeachersSearch(e.target.value)}
                            />
                            <label htmlFor="admin-teachers-search-input-3920vk">
                                <img className="search-icon" src="/images/admin_search.svg" />
                            </label>
                        </div>

                    </div>
                </div>
            </div>
            <div id="teachers-table-container" className="admin-table-container" >
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{trans("signup.first_name")}</th>
                            <th>{trans("signup.last_name")}</th>
                            <th>{trans("class")}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {typeof teachersTDs === "string" ? null : teachersTDs}
                    </tbody>
                </table>
                {typeof teachersTDs === "string" ? <div className="no-table-data">{teachersTDs}</div> : null}
            </div>
        </>
    );
}

export default inject("UsersStore")(observer(AdminTeachersTable));
