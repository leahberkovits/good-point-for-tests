import React from 'react';
import { inject, observer } from 'mobx-react'
import PrintStudentsForSummary from '../components/print_students_for_summary'
import Top from '../components/top'
import ClassesUtils from '../components/ClassesUtils'
import SearchStudentsInClassSummary from '../components/search_students_in_class_summary'
import '../components/CSS/PagesCSS/class_monthly_summary_page.scss'
import SortOptions from '../consts/SortStudentsOptions'
import consts from '../consts/consts';
import { translate } from '../translation/GPi18n';
import { provide } from '@hilma/tools';
import { ConstsContext } from '../contexts/constsContext';
class ClassMonthlySummaryPage extends React.Component {


    constructor(props) {

        super(props);
        this.state = {}
        this.gradeSelected = this.props.StudentsStore.gradeSelected;
        this.indexSelected = this.props.StudentsStore.indexSelected



    }

    componentDidMount() {
        this.props.StudentsStore.sort = SortOptions.GP_SUM_SORT;
    }




    render() {
        if (this.gradeSelected === consts.NO_CLASS_FILTER || this.indexSelected === consts.NO_CLASS_FILTER)
            this.props.history.push('/monthly-summary')

        let teacher = this.props.StudentsStore.selectedClassTeacher;
        let teacherGender = teacher && teacher.gender ? ((teacher.gender === 'MALE') ? this.props.t("send_gp.male_Hteacher") : t.props.t("send_gp.female_Hteacher")) : null;
        const teacherInfo = teacher && teacher.first && teacher.last ? `${teacherGender} ${teacher.first} ${teacher.last}` : t("send_gp.no_teacher")
        let text = `${this.props.t("class")} ${this.props.consts.GET_HEBREW_GRADES[this.gradeSelected - 1]}'${this.indexSelected}, ${teacherInfo}`;


        //will change the greeting text according to the gp count ( zero / one / any other num)
        let gpCounter = teacher ? teacher.gpSum : null;
        let gpText = gpCounter ? this.props.t("greetings.x_gps") : null;
        let gpNum = undefined;
        if (gpCounter === 1) {
            gpNum = this.props.t("good_point")
            gpText = this.props.t("greetings.one")
        }
        if (gpCounter === 0) {
            gpNum = ""
            gpText = this.props.t("greetings.didnt_send")
        }





        return (<div>
            <Top back="/monthly-summary" home={true} text={text} />
            <div id="classGpSum-sentence" ><span id="classGpSum-count" > {(gpCounter < 2) ? gpNum : gpCounter} </span> {gpText} </div>
            <SearchStudentsInClassSummary sort={this.sort} changeSort={this.changeSort} />
            <PrintStudentsForSummary />

        </div >);
    }
}

export default provide({ consts: ConstsContext })(translate(inject("StudentsStore")(observer(ClassMonthlySummaryPage))));
