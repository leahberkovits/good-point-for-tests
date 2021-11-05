import React from 'react';
import CallOnConfetti from '../components/call_on_confetti'
import { translate } from '../translation/GPi18n';

class ChatBoxOnLandingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    dateFormatChange = (date) => {
        // changes date to the format: dd/mm/yy
        date = date.substring(0, 10);
        let array = date.split(/\-/g);
        [array[0], array[array.length - 1]] = [array[array.length - 1], array[0]];
        array[2] = array[2].substr(2, 2)
        return array.join('.')

    }
    render() { //renders also the confetti because the confetti should appear only when this info is renderes too.
        return (<div>
            <div id="teacherName">{`${this.props.t("superadmin.make_admin_status.teacher")} ${this.props.gpinfo.Teacher.firstName} ${this.props.gpinfo.Teacher.lastName}`}</div>
            <div>{this.props.gpinfo.gpText}</div>
            <div id="dateStamp">{this.dateFormatChange(this.props.gpinfo.created)}</div>
        </div>);
    }
}

export default translate(ChatBoxOnLandingPage);