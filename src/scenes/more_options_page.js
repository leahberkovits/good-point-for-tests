import React from 'react';

import Top from '../components/top'
import SwipeableTemporaryDrawer from '../components/HomePageFolder/navbar'
import MoreOptionsList from '../components/more_options_list';
import { useTranslate } from '../translation/GPi18n';

const MoreOptionsPage = (props) => {
    const { t } = useTranslate();
    const [popups, setPopups] = React.useState([])

    const changeUrl = (url) => {
        props.history.push(url)
    }


    return (
        <div>
            <SwipeableTemporaryDrawer />
            <Top text={t("more_options.title")} back={false} home={false} applyNavbarPageStyle={true} />
            <MoreOptionsList openPopups={setPopups} changeUrl={changeUrl} />
            {popups}
        </div>
    );
}

export default MoreOptionsPage;