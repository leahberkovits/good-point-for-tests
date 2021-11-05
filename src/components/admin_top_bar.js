import React from 'react';
import { useTranslate } from '../translation/GPi18n';
import { inject, observer } from 'mobx-react'

import './CSS/admin_top_bar.scss'


const AdminTopBar = (props) => {

    const { t } = useTranslate();

    const fullname = props.name || props.UsersStore.fullName

    return (
        <div id="top-bar">
            <div id="gp-text" >{t("more_options.about.project_name")}</div>
            <div id="admin-name">{`${fullname ? `${fullname.firstName} ${fullname.lastName}` : ''}`}</div>
        </div>
    );
}

export default inject("UsersStore")(observer(AdminTopBar));