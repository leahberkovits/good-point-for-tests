import React from 'react';
import { observer, inject } from "mobx-react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import StudentsSum from './students_sum'
import ClassesSum from './classes_sum'

import ScrollBackUp from '../scroll_button'

import '../CSS/monthly_summary_content.scss'
import { useTranslate } from '../../translation/GPi18n';


function MonthlySummaryContent(props) {
    const { t } = useTranslate();
    let [categoryA, setCategoryA] = React.useState(true);
    let [upButton, setUpButton] = React.useState(false);


    const handleUpButtonChange = (newVal) => {
        if (typeof newVal !== "boolean")
            return;
        if (newVal && !upButton)
            setUpButton(true)
        else if (!newVal && upButton)
            setUpButton(false)
    }


    const categChange = (e) => {
        let newCategoryA = e.target.id === "B" ? false : true
        setCategoryA(newCategoryA)
        props.GoodPointsStore.changeExportButtonDisplay(false);
    }

    return <div id="sum">
        <div id="topbar" className="d-flex justify-content-around align-items-center">
            <div onClick={(e) => { categChange(e) }} id="A" className="type-sum"> {t("classes")} {categoryA ? <hr className="buttonLine" /> : null}</div>
            <div onClick={(e) => { categChange(e) }} id="B" className="type-sum"> {t("students")} {!categoryA ? <hr className="buttonLine" /> : null}</div>
        </div>
        {categoryA ? <ClassesSum changeUrl={props.changeUrl} /> : <StudentsSum changeUrl={props.changeUrl} setUpButton={handleUpButtonChange} monthlyScreenRef={props.monthlyScreenRef} />}
        {upButton && !categoryA ? <ScrollBackUp id="up-button" icon={'arrow-up'} elem={document.getElementById('studentsList-container')} x={0} y={0} /> : null}
    </div>
}

export default inject("StudentsStore", "GoodPointsStore")(observer(MonthlySummaryContent));
