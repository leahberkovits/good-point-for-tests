import React, { useCallback, useMemo } from 'react';
import { inject, observer } from 'mobx-react'

import ClassesUtils from './ClassesUtils'

import { useTranslate } from '../translation/GPi18n';
import { AdminDD } from '../generic-components/admin-dropdown';

import './CSS/update_class_mult_students.scss'

let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms

const UpdateClassMultStudents = ({ StudentsStore, handleRes, text }) => {
    const { t } = useTranslate();

    const [newClass, setNewClass] = React.useState()

    const [openClassDD, setOpenClassDD] = React.useState(null); // grades and class index drop down filters
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time

    const handleDDBlur = useCallback(() => {
        if (!openClassDD) return;
        clearTimeout(ddTO);
        setOpenClassDD(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    })
    const handleDDClick = () => {
        setOpenClassDD(v => !v);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }
    const getClassItems = useMemo(() => {
        let grades = StudentsStore.getHebrewGrades;
        if (!grades || (grades && !grades.length)) {
            return [];
        }
        grades.sort((a, b) => b - a);
        const classesOptions = [];
        let cls;
        let grade;
        for (let i in grades) {
            grade = grades[i]
            const classesInGrade = ClassesUtils.collapseClassList(grade);
            for (let j in classesInGrade) {
                cls = classesInGrade[j];
                classesOptions.push({ key: "k" + cls, divideAbove: (Number(j) === 0 && Number(i) !== 0), value: cls, name: cls }); // divideAbove when first new grade, but not for the first ever grade (dont want a line at the top of the drop down)
                // could switch divideAbove with divideUnder: (Number(j) === classesInGrade.length - 1 && Number(i) !== grades.length - 1)
            }
        }
        return classesOptions;
    }, [StudentsStore.getHebrewGrades])

    return (
        <div className="admin_popups" id="mult-update-class-container489032">

            <div id="text-487329" >{text}</div>

            <div className="admin-new-instance-form-container">
                <div id="mult-update-class-label" >{t("class")}:</div>
                <div className="admin-new-instance-input">
                    <AdminDD
                        showDDItems={openClassDD}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick}
                        ddItems={getClassItems}
                        selectedItem={newClass}
                        handleItemclick={setNewClass}
                        arrowAnimation={arrowAnimation}
                        id="update-class-selection"
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-edit-student-dropdown-items"
                    />
                </div>
            </div>

            <div id="uc-buttons-container">
                <button className="saveAdminForm" disabled={!newClass || !(newClass.name && newClass.name.length)} onClick={() => { if (handleRes) { handleRes(newClass.value) } }} >
                    {t("update")}
                </button>
                <button className="cancelAdminForm" onClick={() => { if (handleRes) { handleRes(false) }; }} >
                    {t("cancel")}
                </button>
            </div>

        </div>
    );
}

export default inject("StudentsStore")(observer(UpdateClassMultStudents));
