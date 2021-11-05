import React, { useEffect } from 'react';
import { observer, inject } from "mobx-react"

import SwipeableTemporaryDrawer from '../components/HomePageFolder/navbar'
import Top from '../components/top';
import MonthlySummaryContent from '../components/MontlySummaryPageFolder/monthly_summary_content'

import '../components/CSS/PagesCSS/monthly_summary_page.scss'
import { useTranslate } from '../translation/GPi18n';

function MonthlySummaryPage(props) {
    const { t } = useTranslate();
    const monthlyScreenRef = React.useRef();
    //in students_sum - setting filters on students to nothing.
    const changeUrl = url => {
        props.history.push(url);
    }


    return <div ref={monthlyScreenRef} id="monthly-summary-page-container">
        <SwipeableTemporaryDrawer isAdmin={props.UsersStore.isAdmin} />
        <Top applyNavbarPageStyle={true} text={t("gp_summary")} /* underText="סמן את התאריכים ואת הכיתות \ והתלמידים להפקת הדוח הרצוי"  */ />
        <MonthlySummaryContent changeUrl={changeUrl} monthlyScreenRef={monthlyScreenRef} />
    </div>
}


export default inject("StudentsStore", "GoodPointsStore", "UsersStore")(observer(MonthlySummaryPage));