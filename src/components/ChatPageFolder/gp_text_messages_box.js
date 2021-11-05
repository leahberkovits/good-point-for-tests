import React, { useEffect } from 'react';
import { observer, inject } from "mobx-react"
import GpTextMessages from './gp_text_messages'
import ScrollButton from '../scroll_button';
import '../CSS/gp_text_messages_box.scss'
import { useTranslate } from '../../translation/GPi18n';

function GpTextMessagesBox(props) {
    const { t } = useTranslate();
    let goodPointsByStudent = props.GoodPointsStore.goodPointsByStudent;
    let [scrollButton, setScrollButton] = React.useState(false);
    let [firstScrollTop, setFirstScrollTop] = React.useState();

    useEffect(() => {
        if (props.messagesContainer && props.messagesContainer.current) {
            props.messagesContainer.current.addEventListener('scroll', handleChatScroll)
            if (props.messagesContainer.current.scrollTop === 0) {
                props.messagesContainer.current.scrollTop = props.messagesContainer.current.scrollHeight //scroll chat messages to bottom
            }
            return () => { props.messagesContainer.current.removeEventListener('scroll', handleChatScroll) }
        }
    })
    useEffect(() => () => { goodPointsByStudent = [] }, []) //will unmount

    const handleChatScroll = (e) => {
        handleFetchMore(e)
        const st = e.target.scrollTop;
        if (!firstScrollTop) setFirstScrollTop(st)
        if ((firstScrollTop - st) > 100) {
            setScrollButton(true)
        } else {
            setScrollButton(false)
        }
    }

    const handleFetchMore = (e) => {
        let hasMore = props.GoodPointsStore.hasMoreChatPoints();
        if (hasMore && e.target.scrollTop === 0) {
            let prevSH = props.messagesContainer.current.scrollHeight;
            props.GoodPointsStore.fetchMorePointsForChat(props.messagesContainer.current, prevSH);
        }
    }

    const dateFormatChange = (date) => {
        // changes date to the format: dd/mm/
        date = date.substring(0, 10);
        let array = date.split(/\-/g);
        [array[0], array[array.length - 1]] = [array[array.length - 1], array[0]];
        array[2] = array[2].substr(2, 2)
        return array.join('.')
    }

    if (typeof goodPointsByStudent === "string") {
        return <div>{goodPointsByStudent}</div>
    }
    if (!goodPointsByStudent) return <div>{t("loading")}</div>

    let messages = goodPointsByStudent.map((gpInfo) => { // TO DO - (shani) - i cant make this "rerender" by 
        let date = dateFormatChange(gpInfo.gpCreated);
        if (gpInfo.teacherFirstName === "current") {
            return <GpTextMessages key={gpInfo.id} text={gpInfo.gpText} date={date} />
        }
        return <GpTextMessages key={gpInfo.id} text={gpInfo.gpText} date={date} teacher={gpInfo.teacherFirstName + " " + gpInfo.teacherLastName} />
    })

    if (!messages.length) {
        messages.unshift(<div key="not_sent">{`${t("gps_not_sent")}${props.GoodPointsStore.selectedStudent.studentFirstName}`}</div>)
    } else {
        props.GoodPointsStore.hasMoreChatPoints() &&
            messages.unshift(<img key="loading_img" src="/images/loading2.gif" id="chatloading" width="25vw" />) //no one should ever play with the loading position and all about the loading addition to the gps array PLEASE!!!!! it added it at the top left of the chat, did not find a way to move it. and b4 it בכלל changed the whole order of the chat messages on the chat!! we dont know why so it's scary thank you.
    }

    return (
        <div ref={props.messagesContainer} className={props.keyboardOpen ? "messages-with-presetk" : "messages-without-presetk"} id="list-of-messages">
            {messages}
            {scrollButton && !props.keyboardOpen && <ScrollButton id="chat-scroll-down" icon={"arrow-down"} elem={document.getElementById('list-of-messages')} options={{ top: document.getElementById('list-of-messages').scrollHeight, behavior: "smooth" }} />}
        </div>
    );

}

export default inject("GoodPointsStore")(observer(GpTextMessagesBox));
