import React, { createElement, useContext, useState } from 'react';
import ErrorPopup from '../components/error_popup';
import DarkBackgroundBehindPopup from '../components/dark_background_behind_popup';
import LoadingPopup from '../components/loading_popup';

import StudentsEditPopup from '../components/admin_students_edit_popup';
import AdminClassEditPopup from '../components/admin_class_edit_popup';
import HomeTeacherForNewClassPopup from '../components/admin_home_teacher_for_new_class_popup';
import AdminNewTeacherSignup from '../components/admin_new_teacher_signup';
import AdminNewUserMessagePopup from '../components/admin_new_user_message_popup';
import AdminNewStudentInstance from '../components/admin_new_student_instance';
import AdminNewClassInstance from '../components/admin_new_class_instance';
import AdminNewInstancePopup from '../components/admin_new_instance_popup';
import UpdateClassMultStudents from '../components/update_class_mult_students';

import AdminTeacherEditPopup from '../components/admin_teacher_edit_popup';

const OpenPopupsContext = React.createContext()

export const useOpenPopups = () => useContext(OpenPopupsContext)

export const OpenPopupsProvider = ({ children }) => {

    const [popupElement, setPopupElement] = useState(null);

    const openPopups = (obj, ...rest) => {
        if (obj && typeof obj === "object" && typeof rest[0] !== "string") {
            // NEW OPEN POPUPS
            // first attribute is an object and the second one isn't a string (the new openPopups is passed only one attribut which is an obj)
            newOpenPopups(obj);
        }
        // FIRST AND OLD OPEN POPUPS
        else oldOpenPopups(obj, ...rest)
    }

    const closePopups = () => {
        setPopupElement(null)
    }

    const newOpenPopups = ({ popup = null, info = null, comp, compProps = {}, moreInfo = [null, null, null], okayText, cancelText, handlePopupClick, text, removePopupOnOutsideClick = false, downloadTemplate, handleStudentsPostSuccess , cb}) => {
        // @Prop cb is used for specific popups only, for every popup, check the prop that gets the @Prop cb 
        // @Prop comp: a component import (var)
        // @Prop compProps: object of props for @Prop comp
        // need to add a case ? best to use the @Prop comp and @prop compProps
        // @Prop cb is currently used for UPDATE_CLASS
        // @Prop text is currently used for ErrorPopup ('ERROR') and for UPDATE_CLASS
        switch (popup) {
            case 'ERROR':
                // for okayText, cancelText and handlePopupClick: pass either as their names or as moreInfo in places 0, 1, 2 accordingly 
                // for text, pass text or in info
                setPopupElement([<ErrorPopup
                    key="0"
                    text={text || info}
                    okayText={okayText || moreInfo[0]}
                    cancelText={cancelText || moreInfo[1]}
                    handlePopupClick={handlePopupClick || moreInfo[2]}
                    openPopups={openPopups}
                    closePopups={closePopups}
                />, <DarkBackgroundBehindPopup key="" closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} />])
                break;
            case 'LOADING':
                setPopupElement([<LoadingPopup key="0" />, <DarkBackgroundBehindPopup key="1" />]) //no option to close on outside click    
                break;
            case 'STUDENT_EDIT':
                setPopupElement([<StudentsEditPopup key="0" openPopups={openPopups} closePopups={closePopups} student={info} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'TEACHER_EDIT':
                setPopupElement([<AdminTeacherEditPopup key="0" openPopups={openPopups} closePopups={closePopups} teacher={info} index={moreInfo[0]} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'CLASS_EDIT':
                setPopupElement([<AdminClassEditPopup key="0" openPopups={openPopups} closePopups={closePopups} classInfo={info} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'NEED_HOME_TEACHER':
                setPopupElement([<HomeTeacherForNewClassPopup key="0" msg={info} topMsg={moreInfo[0]} newClasses={moreInfo[1]} teachersList={moreInfo[2]} openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'NEW_TEACHER_SIGNUP':
                setPopupElement([<AdminNewTeacherSignup key="0" openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'NEW_USER_MESSAGE':
                setPopupElement([<DarkBackgroundBehindPopup key="0" closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} />, <AdminNewUserMessagePopup openPopups={openPopups} key="1" />])
                break;
            case 'NEW_STUDENT_INSTANCE':
                // in order to pass the handleStudentsPostSuccess prop: either as a @Prop handleStudentsPostSuccess, or in @Prop moreInfo[0]
                setPopupElement([<AdminNewStudentInstance key="0" openPopups={openPopups} closePopups={closePopups} handleStudentsPostSuccess={handleStudentsPostSuccess || moreInfo[0]} />, <DarkBackgroundBehindPopup handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} closeOnClick={removePopupOnOutsideClick || true} handleClick={() => { openPopups(null, null) }} key="1" />])
                break;
            case 'NEW_CLASS_INSTANCE':
                if (comp && compProps)
                    // @Prop moreInfo[0] or cb for handleClassesPostSuccess
                    setPopupElement([createElement(comp, { key: "0", openPopups, ...compProps }), <DarkBackgroundBehindPopup handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} closeOnClick={removePopupOnOutsideClick || true} handleClick={() => { openPopups(null, null) }} key="1" />])
                break;
            case 'NEW_INSTANCE_POPUP':
                setPopupElement([<AdminNewInstancePopup key="0" text={info[0]} topText={info[1]} downloadTemplate={downloadTemplate} openPopups={openPopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'UPDATE_CLASS':
                setPopupElement([<UpdateClassMultStudents key="0" text={text || info} handleRes={cb} openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            default:
                if (comp && compProps)
                    setPopupElement([createElement(comp, { ...compProps, key: "0", openPopups, closePopups }), <DarkBackgroundBehindPopup handleClick={removePopupOnOutsideClick ? closePopups : null} closeOnClick={removePopupOnOutsideClick || true} handleClick={closePopups} key="1" />])
                else closePopups()
        }
    }

    const oldOpenPopups = (info = null, popup = null, moreInfo = [null, null, null], removePopupOnOutsideClick = false) => {
        // first openPopups version: need to pass specific values in the specific order 
        switch (popup) {
            case 'ERROR':
                setPopupElement([<ErrorPopup key="0" text={info} okayText={moreInfo[0]} cancelText={moreInfo[1]} handlePopupClick={moreInfo[2]} openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup key="" closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} />])
                break;
            case 'LOADING':
                setPopupElement([<LoadingPopup key="0" />, <DarkBackgroundBehindPopup key="1" />]) //no option to close on outside click    
                break;
            case 'STUDENT_EDIT':
                setPopupElement([<StudentsEditPopup key="0" openPopups={openPopups} closePopups={closePopups} student={info} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'TEACHER_EDIT':
                setPopupElement([<AdminTeacherEditPopup key="0" openPopups={openPopups} teacher={info} index={moreInfo[0]} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'CLASS_EDIT':
                setPopupElement([<AdminClassEditPopup key="0" openPopups={openPopups} closePopups={closePopups} classInfo={info} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'NEED_HOME_TEACHER':
                setPopupElement([<HomeTeacherForNewClassPopup key="0" msg={info} topMsg={moreInfo[0]} newClasses={moreInfo[1]} teachersList={moreInfo[2]} openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'NEW_TEACHER_SIGNUP':
                setPopupElement([<AdminNewTeacherSignup key="0" openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'NEW_USER_MESSAGE':
                setPopupElement([<AdminNewUserMessagePopup openPopups={openPopups} closePopups={closePopups} key="1" />, <DarkBackgroundBehindPopup key="0" closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} />])
                break;
            case 'NEW_STUDENT_INSTANCE':
                setPopupElement([<AdminNewStudentInstance key="0" openPopups={openPopups} closePopups={closePopups} handleStudentsPostSuccess={moreInfo[0]} />, <DarkBackgroundBehindPopup handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} closeOnClick={removePopupOnOutsideClick || true} handleClick={() => { openPopups(null, null) }} key="1" />])
                break;
            case 'NEW_CLASS_INSTANCE':
                setPopupElement([<AdminNewClassInstance key="0" openPopups={openPopups} closePopups={closePopups} handleClassesPostSuccess={moreInfo[0]} />, <DarkBackgroundBehindPopup handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} closeOnClick={removePopupOnOutsideClick || true} handleClick={() => { openPopups(null, null) }} key="1" />])
                break;
            case 'NEW_INSTANCE_POPUP':
                setPopupElement([<AdminNewInstancePopup key="0" text={info[0]} topText={info[1]} downloadTemplate={moreInfo} openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            case 'UPDATE_CLASS':
                setPopupElement([<UpdateClassMultStudents key="0" text={info} handleRes={moreInfo[0]} openPopups={openPopups} closePopups={closePopups} />, <DarkBackgroundBehindPopup closeOnClick={removePopupOnOutsideClick} handleClick={removePopupOnOutsideClick ? () => { openPopups(null, null) } : null} key="1" />])
                break;
            default:
                setPopupElement(null)
        }
    }

    const ctxValue = {
        openPopups,
        closePopups
    }

    return <OpenPopupsContext.Provider value={ctxValue} >
        {children}
        {Array.isArray(popupElement) && popupElement.length ? popupElement.map(e => e) : null}
    </OpenPopupsContext.Provider>
}

// * example:
// / first of all get the context: 
// const genAlertCtx = useGenAlert()
// open an alert: (nice text at the bottom left of the screen)
// genAlertCtx.openGenAlert({ text: "user info was updated successfully" });
// open a popup: (dialog with the use)
// genAlertCtx.openGenAlert({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } });
// / and to get the user's answer add:
// / 1:
// genAlertCtx.openGenAlert({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } }, (answer) => {  } );
// / or 2:
// let answer = await genAlertCtx.openGenAlertSync({ text: "are you sure?", isPopup: { okayText: "yes", cancelText:"no, I take that back" } });

// need help? -shani