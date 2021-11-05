import React from 'react';
import { TextareaAutosize } from '@material-ui/core';
import { useTranslate } from "../translation/GPi18n";

const ProblemReportPage = (props) => {
    const {t} = useTranslate();
    return (
        <div>

            <lable>{t("question.any_broblem")}</lable>
            <textarea />

        </div>
    );
}

export default ProblemReportPage;