import React from 'react';
import { inject, observer } from 'mobx-react'
import { useTranslate } from '../translation/GPi18n';

import ClassesUtils from './ClassesUtils'
import { AdminDD } from '../generic-components/admin-dropdown';
import { useConsts } from '../contexts/constsContext';



let ddTO = null;
const ARROW_ANIMATION_DURATION = 400; //ms
const GRADES_DD = 1;
const CLASSES_DD = 2;
let submitting = false;
const AdminNewClassInstance = (props) => {
    const { t } = useTranslate();
    const [vals, setVals] = React.useState({});
    const [errs, setErrs] = React.useState([]);

    const [openDDFilters, setOpenDDFilters] = React.useState(null); // grades and class index drop down filters
    const [arrowAnimation, setArrowAnimation] = React.useState(false); // otherwise the arrow animation happens only the first time

    const validFields = [GRADES_DD, CLASSES_DD]
    const { GET_HEBREW_GRADES } = useConsts();


    const getGrades = () => {
        let grades = GET_HEBREW_GRADES // grades change
        const gradesOptions = grades.map((g, i) => ({ key: "k" + i, value: ClassesUtils.convertToEnglishGrades(g), name: g }));
        return gradesOptions;
    }
    const getClasses = () => {
        let classes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const classesOptions = classes.map((c, i) => ({ key: "k" + i, value: c, name: c }));
        return classesOptions;
    }

    const handleChange = (item, field) => {
        setVals(currVals => ({ ...currVals, [field]: item }));
        setErrs([]);
    }

    const setErrOnField = (field) => {
        setErrs(errTemp => ({ ...errTemp, [field]: true }));
    }

    const handleSubmit = (vals) => {
        if (submitting) return;
        submitting = true;
        setErrs([]);
        if (!vals || typeof vals !== "object") { // not object?!
            submitting = false
            return;
        }
        const newClassData = {};

        for (let key in vals) {
            newClassData[key] = String(vals[key].value)
        }

        // check if fields in data are empty
        for (let i in validFields) {
            if (!newClassData[validFields[i]] || !newClassData[validFields[i]].length) {
                setErrOnField(validFields[i])
                submitting = false
                return;
            }
        }

        props.openPopups(null, 'LOADING')
        props.StudentsStore.adminAddClassesForm({ grade: newClassData[GRADES_DD], classIndex: newClassData[CLASSES_DD] }, (error, msg, somethingelseidontcare) => {
            props.openPopups(null, null);
            submitting = false;
            props.handleClassesPostSuccess(error, msg, somethingelseidontcare); //idocare
        })

    }

    const closePopup = () => {
        props.openPopups(null, null)
    }

    const handleDDClick = (ddType) => () => {
        clearTimeout(ddTO);
        setOpenDDFilters(v => v ? !v : ddType);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }

    const handleDDBlur = () => {
        if (!openDDFilters) return;
        clearTimeout(ddTO);
        setOpenDDFilters(false);
        setArrowAnimation(true);
        ddTO = setTimeout(() => { setArrowAnimation(false) }, ARROW_ANIMATION_DURATION)
    }


    return (
        <div className="admin_popups admin-new-instance-signup-container" id="admin-new-class-signup-container">
            <h6 className="new-instance-title new-class-title" >{t("admin.classes.add")}</h6>
            <br />
            <div className='admin-new-class-form-container'>
                <div className="admin-new-instance-input" >
                    <div className="bold">{`${t("admin.classes.class_age")}:`}</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === GRADES_DD : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick(GRADES_DD)}
                        ddItems={getGrades()}
                        selectedItem={vals[GRADES_DD] || ""}
                        isError={errs[GRADES_DD] || null}
                        handleItemclick={(item) => { handleChange(item, GRADES_DD) }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-new-instance-dropdown-items"
                    />
                </div>
                <div className="admin-new-instance-input">
                    <div className="bold">{`${t("admin.classes.number")}:`}</div>
                    <AdminDD
                        showDDItems={openDDFilters ? openDDFilters === CLASSES_DD : openDDFilters}
                        handleDDBlur={handleDDBlur}
                        handleDDClick={handleDDClick(CLASSES_DD)}
                        ddItems={getClasses()}
                        selectedItem={vals[CLASSES_DD] || ""}
                        isError={errs[CLASSES_DD] || null}
                        handleItemclick={(item) => { handleChange(item, CLASSES_DD) }}
                        arrowAnimation={arrowAnimation}
                        className="admin-new-instance-dropdown"
                        itemsContainerClassName="admin-new-instance-dropdown-items"
                    />
                </div>
            </div>

            <br />
            <div className="new-instance-buttons-container">
                <div className="newClassBtns admin-cancel-form" onClick={closePopup}> {t("cancel")} </div>
                <div className="newClassBtns admin-save-form" onClick={() => { handleSubmit(vals) }}>{t("end")} </div>
            </div>
        </div>
    );
}

export default inject("StudentsStore")(observer(AdminNewClassInstance));