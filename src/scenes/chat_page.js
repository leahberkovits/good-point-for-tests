import React, { useState, useEffect } from 'react';
import { observer, inject } from "mobx-react"

import PresetCategories from '../consts/PresetCategories'
import Top from '../components/top'
import GoodPointInput from '../components/ChatPageFolder/good_point_input'
import GpTextMessagesBox from '../components/ChatPageFolder/gp_text_messages_box'
import { useTranslate } from '../translation/GPi18n';

function ChatPage(props) {
    const { t } = useTranslate();
    const messagesContainer = React.useRef();
    const [keyboardOpen, setKeyboardOpen] = React.useState(false)

    useEffect(() => {
        return () => props.GoodPointsStore.scrollStudentsListQuestionMark = true
    }, [])


    let { selectedStudent } = props.GoodPointsStore;

    if (selectedStudent === null || !selectedStudent || typeof selectedStudent !== "object") {
        props.history.push('/send-a-good-point'); return;
    }


    props.PresetMessagesStore.studentGender = selectedStudent.studentGender;
    props.PresetMessagesStore.studentName = selectedStudent.studentFirstName;
    props.PresetMessagesStore.selectedCateg = PresetCategories.SOCIAL;

    const changeURL = (link) => {
        props.history.push(link);
    }

    return <div>
        <Top text={`${t("send_gp.write_gp_to")}${selectedStudent.studentFirstName}`} back={props.GoodPointsStore.chatBackTo} home={true} />

        <GpTextMessagesBox keyboardOpen={keyboardOpen} messagesContainer={messagesContainer} />

        <GoodPointInput keyboardOpen={keyboardOpen} setKeyboardOpen={setKeyboardOpen} messagesContainer={messagesContainer} changeURL={changeURL} />
    </div>
}


export default inject("PresetMessagesStore", "GoodPointsStore")(observer(ChatPage));