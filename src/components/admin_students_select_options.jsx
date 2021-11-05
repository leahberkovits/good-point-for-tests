import React from 'react';
import { inject, observer } from 'mobx-react'

import ClassesUtils from './ClassesUtils'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

import { useOpenPopups } from '../contexts/openPopupsContext'
import { useTranslate } from '../translation/GPi18n';
import { useConsts } from '../contexts/constsContext';

const useStyles = makeStyles(() => ({ // yup, this is as important as server.js
    root: {
        boxShadow: "none",
        background: "none",
        color: "#ef8152", // admin orange
        fontWeight: "bold",
        '&:hover': {
            background: "#f0f0f7",
            boxShadow: "none",
        },
        '&:focus': {
            outline: 0,
            border: "2px solid #ef815230",
            borderRadius: 7
        },
    }
}))



export const AdminStudentsSelectOptions = inject('StudentsStore')(observer(({ currTable, StudentsStore }) => {
    const classes = useStyles();
    const { HEBREW_ENGLISH_GRADES } = useConsts();
    // let showAllStudents = StudentsStore.adminShowAllStudents
    const { t } = useTranslate();
    const { openPopups, closePopups } = useOpenPopups();

    const handleDelete = student => {
        let areUSureText;
        if (Array.isArray(student)) {
            if (student.length > 1) areUSureText = t("admin.students.confirm.del_students")
            else areUSureText = t("admin.students.confirm.del_1_student");
        }
        else areUSureText = `${t("admin.students.confirm.are_you_sure_delete")} ${student.firstName} ${student.lastName}?`
        openPopups(areUSureText, 'ERROR', [t("delete"), t("cancel"), (toDelete) => {
            toDelete && StudentsStore.toDeleteStudent(Array.isArray(student) ? student : student.id)
        }], true);
    }
    const handleUpdateClass = students => {
        const text = students.length > 1 ? t("admin.students.confirm.what_class_multi") : t("admin.students.confirm.what_class_one")
        openPopups({ text, popup: 'UPDATE_CLASS', cb: newClass => handleNewClassSelect(students, newClass), removePopupOnOutsideClick: true });
    }
    const handleNewClassSelect = (studentsIds, newClass) => {
        console.log('studentsIds:', studentsIds)
        if (!newClass || newClass === "") {
            closePopups()
            return;
        }
        if (typeof newClass !== "string") {
            openPopups(t("admin.error_try_again"), 'ERROR', [null, null, null], true)
            return;
        }
        let [grade, classIndex] = newClass.split(" ");
        if (!grade || !classIndex || !Object.keys(HEBREW_ENGLISH_GRADES).includes(grade) || classIndex > 15 || classIndex < 1) { // grades change
            openPopups(t("admin.error_try_again"), 'ERROR', [null, null, null], true)
            return;
        }
        grade = ClassesUtils.englishGradesObj[grade]
        newClass && StudentsStore.updateMultStudentsClass(studentsIds, { grade, classIndex }, error => {
            if (error && typeof error === "string") {
                openPopups(error, 'ERROR', [null, null, null], true)
                return;
            }
            closePopups()
        })
    }

    return (
        <>
            <Tooltip title={t("admin.students.delete_all_marked")} enterDelay={300} enterNextDelay={300} >
                <Button
                    classes={classes}
                    variant="contained"
                    size="small"
                    onClick={() => { handleDelete(StudentsStore.getCheckedAdminStudents) }}
                    id="delete-all-selected"
                    startIcon={<DeleteIcon />}
                >
                    {t("admin.students.delete")}
                </Button>
            </Tooltip>
            <Tooltip title={t("admin.students.move_all")} enterDelay={300} enterNextDelay={300} >
                <Button
                    classes={classes}
                    variant="contained"
                    size="small"
                    onClick={() => { handleUpdateClass(StudentsStore.getCheckedAdminStudents) }}
                    id="update-class-all-selected"
                    startIcon={<FontAwesomeIcon icon="book-reader" />}
                >
                    {t("admin.students.move_to_class")}
                </Button>
            </Tooltip>
        </>
    )
})) 
