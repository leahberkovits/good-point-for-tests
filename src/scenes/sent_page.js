import React from 'react';
import SentPoint from '../components/sent_point'
import { inject, observer } from 'mobx-react'
import ReactConfetti from 'react-confetti';

import utils from '../components/functionUtils'

function SentPage(props) {

    if (props.GoodPointsStore.selectedStudent === null || !props.GoodPointsStore.selectedStudent || !Object.keys(props.GoodPointsStore.selectedStudent).length) {
        props.history.push('/')
        return;
    }

    return <div style={{ height: "100%", display: "inline-grid" }}>
        <SentPoint />
        <ReactConfetti
            recycle={false}
            numberOfPieces={8}
            gravity={-0.1}
            // gravity={.2}
            confettiSource={{ x: utils.vwTOpx("51.5"), y: utils.vhTOpx("48"), w: 100, h: 0 }}
            initialVelocityY={1}
            colors={["#d4145a", "#e91663", "#eb2d73", "#ee4482", "#f05c92", "#f273a2", "#f48ab1"]}
            drawShape={(ctx) => {
                ctx.scale(.2, .2)
                ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
                ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
                ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
                ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
                ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
                ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
                ctx.rotate(Math.PI);
                ctx.fill();
            }} />
    </div>


}
export default inject("GoodPointsStore")(observer(SentPage));