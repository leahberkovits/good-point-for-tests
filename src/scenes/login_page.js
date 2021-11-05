import React from 'react';


import LogIn from '../components/LoginPageFolder/log_in'
import Welcome from '../components/LoginPageFolder/welcome'
import ResetPassword from '../components/LoginPageFolder/forgot_password';
import { observer, inject } from "mobx-react"
// import IDMLogin from '../components/idm_login'
// import SignUp from '../components/LoginPageFolder/sign_up'
// import SetUsernameAndPass from '../components/LoginPageFolder/set_username_and_pass'

import '../components/CSS/PagesCSS/login_page.scss'
import { Link } from 'react-router-dom';
import { useTranslate } from '../translation/GPi18n';


const LoginPage = (props) => {
    const { t } = useTranslate();

    return (
        <div id="log-in-container">

            <div className="login-page-space" id="login-page-space-0"></div>

            <div id="Welcome-container">
                <Welcome />
            </div>

            <div className="login-page-space" id="login-page-space-1"></div>

            {!props.GoodPointsStore.changePass ?
                <div id="logInForm-container" >
                    <LogIn postLogin={props.postLogin} />
                </div>
                : null}

            <div className="login-page-space" id="login-page-space-2"></div>

            <div className="login-page-space" id="login-page-space-3" ></div>

            <div id={props.GoodPointsStore.changePass ? 'resetPassword-container-open' : 'resetPassword-container'}>
                <ResetPassword />
            </div>

            {/* <div className="login-page-space" id="login-page-space-4" ></div> */}
            <Link to="/" style={{ marginBottom: "3%" }} onClick={() => localStorage.removeItem('lang')}>{t("back_to_about")} </Link>
            {/* <IDMLogin /> */}

            <div id="welcomeImg">
                <img id="image" src="/images/loginImg.png" alt="welcome picture" />
            </div>

            <button id="accessibility" onClick={() => {
                props.history.push('/accessibility');
            }}>
                <img id="image" src="/images/accessibility.svg" alt="accessibility" />
            </button>

        </div>
    );

}
export default inject("GoodPointsStore")(observer(LoginPage));
