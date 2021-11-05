import React, { useEffect } from 'react';
import { observer, inject } from "mobx-react"
import Consts from '../../consts/consts'
import '../CSS/gp_text_messages.scss'

function GpTextMessages(props) {

    useEffect(() => {
        let textDivs = document.getElementsByClassName("text-invisible-div");
        let chatBoxs = document.getElementsByClassName("text-box");
        let chatWidth;
        let textWidth;
        for (let i = 0; i < textDivs.length; i++) {
            chatWidth = (chatBoxs[i].clientWidth + 1)
            textWidth = (textDivs[i].clientWidth + 1)
            if (textWidth > chatWidth) {
                textDivs[i].textContent = textDivs[i].textContent.match(new RegExp('.{1,' + 20 + '}', 'g')).join('\n');
            }
        }


    }, [])

    let backgroundColorClass = "brown";
    props.teacher && (backgroundColorClass = "grey")
    return <div key={props.key} className={`${backgroundColorClass} text-box`}>
        {props.teacher && <strong id="teacherName">{props.teacher}</strong>}
        <div className="text-invisible-div">
            <p id="messageText">
                {props.text}
            </p>
        </div>
        <div id="chatDate">{props.date}</div>
    </div>
}
export default inject("GoodPointsStore")(observer(GpTextMessages));
