import React from 'react';
import { inject, observer } from 'mobx-react'
import SearchStudentsForSum from './search_students_for_monthly_sum'
import ClassesUtils from '../ClassesUtils';
import '../CSS/students_sum.scss'
import ExcelStudentPopup from './excel_student_popup';
import ElementsHandler from '../../handlers/ElementsHandler'
import Consts from '../../consts/consts'
import DarkBackgroundBehindPopup from '../dark_background_behind_popup';
import consts from '../../consts/consts';
import { translate } from '../../translation/GPi18n';


class StudentsSum extends React.Component {
    constructor(props) {
        super(props);
        this.ElementsHandler = new ElementsHandler(this);
        this.backgroundDiv = React.createRef()
        this.state = {
            clickedX: false,
            listAnimation: false
        }

        this.lang = this.props.i18n.language;
        this.gradesF()
    }

    gradesF = () => {
        let grades = {};
        [1, 2, 3, 4, 5, 6, 7, 8].forEach(item => grades[this.props.t("grades." + item)] = item);
        this.grades = Object.keys(grades);
    }


    componentDidMount() {
        this.props.GoodPointsStore.setError('')
        this.props.GoodPointsStore.changeExportButtonDisplay(true);
        this.props.StudentsStore.grade = consts.NO_CLASS_FILTER
        this.props.StudentsStore.index = consts.NO_CLASS_FILTER
        this.props.StudentsStore.setStudentsFilter(consts.NO_STUDENTS_FILTER)
    }


    handleClickedX = (wasClicked) => {
        this.setState({ clickedX: wasClicked, listAnimation: false });
        setTimeout(() => {
            this.setState({ clickedX: false })
        }, 500)
    }
    handleStudentClick = (student, clas, grade) => {
        this.props.monthlyScreenRef.current.className = "faded-background"
        this.ElementsHandler.addElement(Consts.EXCEL_STUDENT_POPUP_KEY,
            <ExcelStudentPopup removeExcelStudentsPopup={this.handleRemoveStudentsExcelPopup} backgroundDiv={this.backgroundDiv} />)

        this.ElementsHandler.addElement(Consts.EXCEL_POPUP_BACKGROUND_KEY,
            <DarkBackgroundBehindPopup backgroundDiv={this.backgroundDiv} />
        )
        this.props.GoodPointsStore.changeSelectedStudentForExcel({ "studentFirstName": student.firstName, "studentLastName": student.lastName, "studentId": student.id, 'studentGender': student.gender, "classIndex": clas, "grade": grade });
    }

    handleRemoveStudentsExcelPopup = (exportBool = true) => {
        setTimeout(() => {
            this.ElementsHandler.removeElement(Consts.EXCEL_POPUP_BACKGROUND_KEY)
            this.ElementsHandler.removeElement(Consts.EXCEL_STUDENT_POPUP_KEY)
        }, 500)
        if (!exportBool) return;
        //export funcion in gps store
    }

    handleScroll = (e) => {
        const sListEl = e.target
        if (sListEl.scrollTop >= (sListEl.scrollHeight - sListEl.offsetHeight - 2))
            this.props.StudentsStore.fetchMoreStudentsForSumOnScroll()
        sListEl.scrollTop > 100 ? this.props.setUpButton(true) : this.props.setUpButton(false)
    }

    render() {
        if (this.lang != this.props.i18n.language)
            this.gradesF();
        let students = this.props.StudentsStore.studentsFilter ? this.props.StudentsStore.filteredStudents : '';

        if (students === null) students = this.props.t("loading")

        else if (Array.isArray(students) && !students.length) students = `${this.props.t("errors.not_found")} ${this.props.t("students")}`

        else if (students && typeof students !== "string") {
            students = students.sort((a, b) => (a.gpCount > b.gpCount ? 1 : a.gpCount < b.gpCount ? -1 : (a.firstName > b.firstName ? 1 : (a.firstName < b.firstName ? -1 : (a.lastName > b.lastName ? 1 : (a.lastName < b.lastName ? -1 : 0))))));
            students = students.map((student, i) => {
                let clas = student.Class.classIndex;
                let grade = this.grades[student.Class.grade - 1];

                if ((students.length > 0) && !this.state.listAnimation && !this.state.clickedX) {
                    this.setState({ listAnimation: true })
                }
                return <div key={student.id} className={this.state.listAnimation ? 'slide-in-bottom3' : 'slide-out-bottom3'}>
                    <table onClick={() => { this.handleStudentClick(student, clas, grade) }} alignItems={"center"} className="students-table">
                        <tr id="student-container">
                            <td id="studentIcon-td"><img src="/images/userIcon.png" width="45vw" alt="students icon" /></td>
                            <td id="studentInfo-td">
                                <div id="studentName" spellCheck="false">{student.firstName + " " + student.lastName}</div>
                                <div id="studentsClass">{"כיתה " + grade + clas}</div>
                            </td>
                            <td id="countByStud-td">{student.gpCount}</td>
                            <td id="heartContainer-td"><img src="/images/heart.png" alt="logo img" width="20vw" /></td>
                        </tr>
                    </table>
                    <hr />
                </div >
            }) //end map
        }

        return <div id="studentsSum-container">
            <SearchStudentsForSum handleClickedX={this.handleClickedX} />

            <div id="studentsList-container" onScroll={this.handleScroll}>
                {students}
            </div>
            {this.ElementsHandler.getElements().map(item => item.elem)}
        </div>
    }

}

export default translate(inject("StudentsStore", "GoodPointsStore")(observer(StudentsSum)));
