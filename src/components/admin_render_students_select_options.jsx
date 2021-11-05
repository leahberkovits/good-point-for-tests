import React from 'react'
import { inject, observer } from 'mobx-react'

import AdminAddNewInstance from './admin_add_new_instance';
import { AdminStudentsSelectOptions } from '../components/admin_students_select_options';

import ClassesUtils from './ClassesUtils'
import consts from '../consts/consts'

import { makeStyles } from '@material-ui/core/styles';
import { Button, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useOpenPopups } from '../contexts/openPopupsContext'

export const AdminRenderTopLeftOfStudentsTable = inject('StudentsStore')(observer(({ currTable, StudentsStore }) => {


    if (!StudentsStore.getCheckedAdminStudents || !StudentsStore.getCheckedAdminStudents.length) // no students checked, students select option has no business here
        // regular
        return <div id="admin-excel-uploader-container"><AdminAddNewInstance currTable={currTable} /></div>

    if (StudentsStore.useStudentsShowMoreFilters[0]) { // selected students+filters --> show both
        // show both
        return <>
            <div id="admin-excel-uploader-container">
                <AdminAddNewInstance currTable={currTable} />
            </div>
            <div id="admin-students-table-options-container">
                <AdminStudentsSelectOptions currTable={currTable} />
            </div>
        </>
    }

    // show options
    return <div id="admin-excel-uploader-container"><AdminStudentsSelectOptions currTable={currTable} /></div> // selected students witout filters
}))
