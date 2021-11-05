import React, { useEffect } from 'react';
import { observer, inject } from "mobx-react"
import PrintClasses from './print_classes'
import ExcelMonthSelection from './excel_month_selection'
import ExportExcelButton from '../export_excel_button';


function ClassesSum(props) {

    return (
        <div id="classesSumContainer">
            <ExcelMonthSelection />
            <PrintClasses changeUrl={props.changeUrl} />
            <ExportExcelButton />
        </div>
    );
}

export default inject("GoodPointsStore")(observer(ClassesSum));