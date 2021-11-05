import React, { useEffect } from 'react';
import { observer, inject } from "mobx-react"

import CallOnConfetti from '../components/call_on_confetti'

import InfoForParentsSMS from '../components/info_parent_sms'
import CopyToClipboard from '../components/parents_landing_page_copy_to_clipboard';

function SMSPage(props) {
    const [weGotInfo, setWeGotInfo] = React.useState(false);
    const callOnConfetti = () => {
        setWeGotInfo(true);
    }

    return (
        <div id="sms-page-container">
            {weGotInfo && <CallOnConfetti />} {/* CONFETTI */}
            <InfoForParentsSMS callOnConfetti={callOnConfetti} />
            {weGotInfo && <CopyToClipboard />}


        </div>);
}

export default inject("GoodPointsStore")(observer(SMSPage));