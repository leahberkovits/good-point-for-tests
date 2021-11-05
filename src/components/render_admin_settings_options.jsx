import React from 'react';
import AdminSettingOption from '../generic-components/admin_setting_option';


export const RenderAdminSettingsOptions = ({ options }) => options.map(op =>
    <AdminSettingOption
        key={op.buttonText}
        title={op.title}
        onClick={op.onClick}
        buttonText={op.buttonText}
        text={op.text}
        htmlFor={op.htmlFor}
    />)