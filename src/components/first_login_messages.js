import React from 'react';
import { observer, inject } from "mobx-react"
import { useTranslate } from '../translation/GPi18n';

import { Button } from '@material-ui/core';

import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'

import './CSS/first_login_messages.scss'



const FirstLoginMessages = (props) => {
    const { t } = useTranslate();
    const [btnClick, setBtnClick] = React.useState(false)


    const clickStyle = () => {
        setBtnClick(true)
        setTimeout(async () => {
            setBtnClick(false)
            await props.UsersStore.removeInstrucPopups() //not updating observable so other conditions don't suddenly apply (like first simpleuser login)
            props.UsersStore.removeSendAGPBubble(10000) //could maybe add a firstLogin condition for calling this func
        }, 150)
    }


    const { fullName, firstLogin, firstAdminLogin, isAdmin } = props.UsersStore;
    const femaleUser = fullName ? fullName.gender.toLowerCase() === GenderOptionsLowerCased.FEMALE : null;

    const welcomeText = (femaleUser ? t("welcome_female") :t("welcome")) + t("to_good_point")
    const gotAllInfo = isAdmin !== null && (isAdmin !== null ? (firstAdminLogin !== null && firstLogin !== null) : (firstLogin !== null))

    const adminLogin = isAdmin && firstAdminLogin && firstLogin;
    const login = !firstAdminLogin && firstLogin
    const admin = isAdmin && firstAdminLogin && !firstLogin

    return (
        <div>
            {!gotAllInfo ? null :
                (adminLogin ? //first login as admin
                    <div className="home-page-info-alert" id="first-login-and-admin-edit-fyi">
                        <div>
                            <div className="welcome" >{welcomeText} </div>
                            <img className="hrImg" src="/images/shadowHrCheatsheet.png" alt="divider" />
                        </div>
                        <div className="fullMsg-container">
                            <div className="changePass-msg">
                                {t("login_change_psw")}
                            <span>&nbsp;</span><a onClick={props.UsersStore.removeInstrucPopups} href="/#/change-password?b=h" className="changePasswd-ref">{t('here')}</a>
                            </div>
                            <div>{`${t("explaintions.open.admin_web.should_know")}, ${femaleUser ? t("explaintions.open.admin_web.asF") : t("explaintions.open.admin_web.asM")} ${t("explaintions.open.admin_web.you_can")} ${femaleUser ? t("explaintions.open.admin_web.adminF") : t("explaintions.open.admin_web.adminM")} ${t("explaintions.open.admin_web.will_open")} `}</div>
                        </div>
                        <div className={`close-welcome-btn ${btnClick ? 'close-welcome-btn-click' : ""}`} onClick={clickStyle} variant="outlined" >{t("got_it")}</div>
                    </div>

                    : (login ? //first login and is not admin?
                        <div className="home-page-info-alert" >
                            <div>
                                <div className="welcome" >{welcomeText} </div>
                                <img className="hrImg" src="/images/shadowHrCheatsheet.png" alt="divider" />
                            </div>
                            <div className="fullMsg-container">
                                <div className="changePass-msg">
                                    {t("login.change_psw")}
                                    <span>&nbsp;</span><a onClick={props.UsersStore.removeInstrucPopups} href="/#/change-password?b=h" className="changePasswd-ref">{t('here')}</a>
                                </div>
                            </div>
                            <div className={`close-welcome-btn ${btnClick ? 'close-welcome-btn-click' : ""}`} onClick={clickStyle} >{t("got_it")}</div>
                        </div> :
                        (admin ?
                            <div className="home-page-info-alert" id="first-admin-edit-fyi">
                                <div>{`${t("explaintions.open.admin_web.should_know")}, ${femaleUser ? t("explaintions.open.admin_web.asF") : t("explaintions.open.admin_web.asM")} ${t("explaintions.open.admin_web.you_can")} ${femaleUser ? t("explaintions.open.admin_web.adminF") : t("explaintions.open.admin_web.adminM")} ${t("explaintions.open.admin_web.will_open")} `}</div>
                                <div className={`close-welcome-btn ${btnClick ? 'close-welcome-btn-click' : ""}`} onClick={clickStyle} >{t("got_it")}</div>
                            </div>
                            : null)))}
        </div>
    );
}

export default inject("UsersStore")(observer(FirstLoginMessages));
