import React from 'react';
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import SortOptions from '../consts/SortStudentsOptions'

import './CSS/print_students_for_summary.scss'

function PrintStudentsForSummary(props) {

    let students = props.StudentsStore.filteredStudents;

    if (!students || students === null) return <div> {t("loading")} </div>

    if (!students.length) return <div>{`${t("errors.not_found")} ${t("students")}`}</div>

    if (typeof students === "string") return <div>{students}</div>;

    if (props.StudentsStore.sort === SortOptions.ALPHABETIC_SORT) {
        students = students.sort((a, b) => (a.firstName < b.firstName) ? -1 : (a.firstName > b.firstName) ? 1 : 0)
    } else { students = students.sort((a, b) => a.gpCount - b.gpCount) }

    students = students.map(student => {
        return <div key={student.id} id="studentsSumTable" >
            <table>
                <Link to="/write-a-good-point"
                    onClick={() => {
                        props.GoodPointsStore.student({ "studentFirstName": student.firstName, "studentLastName": student.lastName, "studentId": student.id, "studentGender": student.gender, "classIndex": student.Class.classIndex, "grade": student.Class.grade })
                        props.GoodPointsStore.chatBackTo = "/class-monthly-summary"
                    }} >
                    <tr>
                        <td id="student-icon"><img src="/images/userIcon.png" width="55vw" alt="students icon" /></td>
                        <td id="studentName" spellCheck="false">{student.firstName + " " + student.lastName}</td>
                        <td id="countByStud">{student.gpCount > 0 && student.gpCount}</td>
                        <td id="heartContainer"><img src="/images/heart.png" alt="logo img" width="20vw" /></td>
                    </tr>
                </Link>
            </table>
            <hr />
        </div>
    }) // map end
    return <div id="class-summary-scrollable-student-container">
        {students}
    </div>


}

export default inject("StudentsStore", "GoodPointsStore")(observer(PrintStudentsForSummary));
