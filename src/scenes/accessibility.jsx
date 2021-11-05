import React from "react";
import "../components/CSS/PagesCSS/accessibility_page.scss";
import { useTranslate } from "../translation/GPi18n";
import { askForPermissionToReceiveNotifications } from "../push-notification";

const Accessibility = (props) => {
  const { t } = useTranslate();

  return (
    <div id="accessibility-container">
      <div id="header-container">
        <h3>{t("accessibility.header")}</h3>
      </div>
      <div className="accessibility-content">
        <h4 className="bold">{t("accessibility.general_header")}</h4>
        <h5>{t("accessibility.general_content")}</h5> <br></br>
        <h4 className="bold">{t("accessibility.os_header")}</h4>
        <h5>{t("accessibility.os_content")}</h5>
        <br></br>
        <h4 className="bold">{t("accessibility.accessibility_header")}</h4>
        <h5>{t("accessibility.accessibility_content")}</h5>
        <br />
        <ul>
          <li>
            {t("accessibility.mail")} - <a href="#">leah1berkovits@gmail.com</a>
          </li>
          <li>{t("accessibility.phone")} - 0587600235</li>
        </ul>
      </div>

      <button
        onClick={() => {
          askForPermissionToReceiveNotifications();
        }}
      >
        notification
      </button>
    </div>
  );
};

export default Accessibility;
