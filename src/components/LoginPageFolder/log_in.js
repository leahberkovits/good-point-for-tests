import React, { useState, useRef, useEffect } from 'react';

// import Login from '../../modules/auth/Login.jsx'

import { block_time_ms_login, USER_BLOCKED_ERROR_CODE } from '../../consts/consts.js';
import Auth from '../../modules/auth/Auth.js';
import { useGenAlert } from "../../contexts/generalAlertCtx";
import '../CSS/login.scss'
import { useTranslate } from '../../translation/GPi18n';

let failureCnt = 0;

function LogIn({ postLogin, ...props }) {

    const { openGenAlert } = useGenAlert()
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslate();

    const emailRef = useRef();
    const pwRef = useRef();

    const handleLogin = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            let res = await Auth.login(emailRef.current.value, pwRef.current.value, null);
            setIsLoading(false);
            if (!res.success) {
                let errorHeb = t("alerts.try_again_internet");
                if (res.msg && res.msg.error && res.msg.error.code) {
                    errorHeb = getErrorMsg(res.msg.error);
                    // if (failureCnt === 5) {
                        // not good, cos user can change the username and the server will not count it and we don't know that (could get that info, but, no)
                    //     openGenAlert({ text: `${t("login.blocked_for")}${block_time_ms_login / 60000} ${t("login.minute")}`, center: true });
                    //     return
                    // }
                }
                openGenAlert({ text: errorHeb, center: true });
                return;
            }
            postLogin();
            //if res.success is true
            let pwdResetRequired = res.user && res.user.pwdResetRequired;
            const redirTo = pwdResetRequired ? "/#/new-password" : "/#/";
            window.location = redirTo;
        } catch (e) { }
    }
    const getErrorMsg = (error) => {
        switch (error.code) {
            case 'LOGIN_FAILED':
                failureCnt++;
                return t("validation.one_or_more");
            case 'USERNAME_EMAIL_REQUIRED':
                return t("validation.insert_psw_name");
            case USER_BLOCKED_ERROR_CODE:
                return `${t("login.blocked_for")}${block_time_ms_login / 60000} ${t("login.minute")}`;
            default:
                return error.msg || t("alerts.try_again_internet");
        }
    }


    return (
        <div className='form' id="form">
            <form onSubmit={handleLogin} >
                <div className='form-group'>
                    <input id="username" ref={emailRef} dir="ltr" autoComplete="off" className="form_field" type='email' placeholder={t("login.email")} required />
                </div>
                <div className='form-group'>
                    <input id="password" ref={pwRef} dir="ltr" autoComplete="off" onKeyPress={(e) => { (e.key.toLowerCase() === "enter") && handleLogin(e) }} className="form_field" type='password' placeholder={t("login.password")} required />

                </div>
                <div className='form-group'>
                    {isLoading ?
                        <button id="submit" >{t("login.loading")}</button> :
                        <button id="submit" type='submit'>{t("login.enter")}</button>
                    }
                </div>
            </form>
        </div>
    );
}

export default LogIn;
