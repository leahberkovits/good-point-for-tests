import React from 'react';
import { inject, observer } from 'mobx-react'
import '../CSS/greeting.scss'
import { useTranslate } from '../../translation/GPi18n';

function Greeting(props) {
    const { t } = useTranslate();
    const [error, setError] = React.useState(false);


    const fullName = props.fullName
    let gpCounter = props.GoodPointsStore.getGPCounter

    // if (gpCounter.then) { Promise.resolve(gpCounter) } //this is bcos there was an errorrrr saying it can't render an object, something abt a Promise too

    //will change the greeting text according to the gp count ( 0 / 1 / >1)
    let gpOpeningText = t("greetings.so_far");
    let gpText = t("greetings.x_gps")
    var gpNum = "";
    if (gpCounter === 1) {
        gpOpeningText = t("greetings.one_sent")
        gpNum = t("greetings.one")
        gpText = ""
    }
    if (gpCounter === 0) {
        gpOpeningText = t("greetings.didnt_send")
        gpNum = ""
        gpText = ""
    }


    const FNready = !!fullName
    const GPCready = typeof gpCounter === "number";

    return <div id="greeting-container" >
        <div className="sentences-container">
            <div className="sentence" id="sentence1" spellCheck="false" >{error ? "" : (FNready ? `${t("hello")} ${fullName.firstName} ${fullName.lastName}` : '')}</div>
            <div className="sentence" id="sentence2" >{error ? "" : (GPCready ? gpOpeningText : '')}
                <span id="gpCount" > {error ? '' : (GPCready ? ((gpCounter < 2) ? gpNum : gpCounter) : null)} </span>
                {error ? "" : (GPCready ? gpText : null)} </div>
        </div>
    </div>
}

export default inject("UsersStore", "GoodPointsStore")(observer(Greeting));
