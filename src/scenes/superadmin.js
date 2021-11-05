import React from 'react';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import { Button } from '@material-ui/core';

import AdminTopBar from '../components/admin_top_bar';

import GradeInc from '../components/super_admin_grade_inc'
import ResetPoints from '../components/super_admin_reset_points';
import MakeTeacherAnAdmin from '../components/make_teacher_an_admin';
import SuperAdminPresetMessagesEdit from '../components/superadmin_preset_messages_edit';
import CreateASchoolAdmin from '../components/create_a_school_admin';

import DarkBackgroundBehindPopup from '../components/dark_background_behind_popup'

import GenericTools from '../modules/tools/GenericTools';
import Auth from '../modules/auth/Auth';


import '../components/CSS/superadmin.scss'
import { useTranslate } from '../translation/GPi18n';

const theme = createMuiTheme({
    direction: 'rtl',
    palette: {
        primary: {
            main: "#ef8142"
        }
    }
});



const SuperAdmin = () => {

    const [errorMsg, setErrorMsg] = React.useState(null)
    const [popup, setPopup] = React.useState(null)

    const { t } = useTranslate();

    return (
        <ThemeProvider theme={theme}>
            <div id="super-admin-container" >
                <AdminTopBar name="" />
                <div id="functions-container">

                    <GradeInc setPopup={setPopup} setErrorMsg={setErrorMsg} />

                    <ResetPoints setPopup={setPopup} setErrorMsg={setErrorMsg} />

                    <MakeTeacherAnAdmin setPopup={setPopup} setErrorMsg={setErrorMsg} />

                    <Button variant="outlined" onClick={() => { setPopup([<SuperAdminPresetMessagesEdit setPopup={setPopup} setErrorMsg={setErrorMsg} />, <DarkBackgroundBehindPopup closeOnClick={true} handleClick={() => { setPopup(null) }} />]) }} >{t("superadmin.edit_opennings")}</Button>

                    <Button variant="outlined" onClick={() => { setPopup([<CreateASchoolAdmin setPopup={setPopup} setErrorMsg={setErrorMsg} />, <DarkBackgroundBehindPopup />]) }} > {t("superadmin.add_admin")}</Button>

                    <Button variant="outlined" onClick={() => { GenericTools.safe_redirect('/change-password?b=h') }} > {t("login.change_p")}</Button>

                </div>

                {popup && popup.length ? popup.map(e => e) : null}

                <Button variant="contained" onClick={() => { Auth.logout() }} >{t("logout")}</Button>

                {!errorMsg || !errorMsg.length ? null : < div className="alertMsg" >{errorMsg}</div>}
            </div >
        </ThemeProvider >
    );
}

export default SuperAdmin;