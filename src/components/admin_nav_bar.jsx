import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './CSS/admin_nav_bar.scss'
import { inject, observer } from 'mobx-react';
import { useConsts } from '../contexts/constsContext';
import { useTranslate } from '../translation/GPi18n';


const AdminNavBar = ({ setNav, nav, UsersStore }) => {
    const { t } = useTranslate();
    const { ADMIN_POINTS_TABLE, ADMIN_CLASSES_TABLE, ADMIN_STUDENTS_TABLE, ADMIN_TEACHERS_TABLE, ADMIN_SETTINGS } = useConsts();

    const NAVBAR = [
        { value: ADMIN_POINTS_TABLE, name: t("points"), icon: "hand-holding-heart" },
        { value: ADMIN_CLASSES_TABLE, name: t("classes"), icon: "book-reader" },
        { value: ADMIN_STUDENTS_TABLE, name: t("students"), icon: "user-graduate" },
        { value: ADMIN_TEACHERS_TABLE, name: t("teachers"), icon: "chalkboard-teacher" },
        { value: ADMIN_SETTINGS, name: t("setting"), icon: "cog" }]

    const fullname = UsersStore?.fullName

    return (
        <div id="top-bar">
            <div id="top-bar-inner" className="hide-scrollbars">
                <div id="nav-container">
                    <div id="gp-text">{t("good_point")}</div>

                    {/* <div id="admin-nav-items-container" > */}
                    {NAVBAR.map(navItem =>
                        <div key={navItem.value} onClick={() => setNav(navItem.value)} className={`nav-item ${nav === navItem.value ? "nav-item-selected" : ""}`} >
                            <FontAwesomeIcon className="nav-item-icon" icon={navItem.icon} />
                            <div className="nav-item-name">{navItem.name}</div>
                        </div>)}
                    {/* </div> */}
                </div>

                <div id="admin-name">{`${fullname ? `${fullname.firstName} ${fullname.lastName}` : ''}`}</div>

            </div>
        </div>
    );
}

export default inject("UsersStore")(observer(AdminNavBar));