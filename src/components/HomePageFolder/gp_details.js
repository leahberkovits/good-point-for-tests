import React from 'react';
import { observer, inject } from "mobx-react"
import { translate } from "../../translation/GPi18n";
import { Link } from 'react-router-dom'

import '../CSS/gp_details.scss'


class GPDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }

        this.lang = this.props.i18n.language;
        this.gradesF()
    }

    gradesF = () => {
        let grades = {};
        [1, 2, 3, 4, 5, 6, 7, 8].forEach(item => grades[this.props.t("grades." + item)] = item);
        this.grades = Object.keys(grades);
    }


    handleQuickGPClick = () => {
        this.props.GoodPointsStore.student({ "studentFirstName": this.props.first, "studentLastName": this.props.last, "studentId": this.props.studentId, "studentGender": this.props.gender, "classIndex": this.props.classIndex, "grade": this.props.grade });
        this.props.GoodPointsStore.chatBackTo = "/";
        //GA
        window.gtag("event", 'quick_gp', { event_category: "home_page", event_label: "Click fast gp." })

    }
    render() {
        if (this.lang != this.props.i18n.language)
            this.gradesF();
        return <div key={this.props.id} id="gp_msg" onClick={() => { this.props.handleGPClick(this.props.id); }}>
            <table id="gp_table" className='ripple'>
                <tbody>
                    <tr>
                        <td rowSpan="2" id="img_container">
                            <img src='images/userIcon.png' width="45vw" alt="studentIcon" />
                        </td>
                        <td className="middle_col" id="student_name" > {this.props.first + " " + this.props.last} </td>
                        <td id="small_plus" className="last_col">
                            <Link to="/write-a-good-point">
                                <img src="/images/plusButton.png" width="25vw" onClick={() => { this.handleQuickGPClick() }} />
                            </Link>
                        </td>
                    </tr>

                    <tr>
                        <td id="gp_text" className="middle_col">
                            {this.props.text}
                        </td>
                    </tr>
                    <tr id="last-gp-details-row">
                        <td id="gp_date" className="last_col">
                            {this.props.t("class_plus_spc") + this.grades[this.props.grade - 1] + this.props.classIndex + ' | ' + this.props.date}
                        </td>
                    </tr>
                </tbody>
            </table>
            <hr />
        </div>
    }
}

export default translate(inject("GoodPointsStore")(observer(GPDetails)));