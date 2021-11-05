import React, { useEffect } from 'react';
import Confetti from 'react-confetti'

function CallOnConfeti(props) {
    const COLORS = [
        ["#F8DC65", "#ee4271", "#a6d4e6", "#F290BE"], //light blue, light pink, lignt orange and pink
        ["#edb25e", "#eba747", "#e69119", "#f7deba"], //orange colors
        ["#d4145a", "#e91663", "#eb2d73", "#ee4482", "#f05c92", "#f273a2", "#f48ab1"], //pink colors
        ["#f5d3a3", "#f5cba0", "#f4c29c", "#f4ba99", "#f3b296", "#f3aa92", "#f2a18f", "#f2998c", "#f19189", "#f18885", "#f08082", "#f0787f", "#f06f7b"] // orange, and turns to a little pink 
    ]

    const makeHeart = (ctx) => {
        ctx.scale(.2, .2)
        ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
        ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
        ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
        ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
        ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
        ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
        ctx.fill();
    }

    const makeStar = ctx => {
        let cx = 75, cy = 100, spikes = 5, outerRadius = 30, innerRadius = 15;
        let rot = Math.PI / 2 * 3, x = cx, y = cy, step = Math.PI / spikes;
        ctx.beginPath();
        ctx.scale(.3, .3);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y)
            rot += step
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y)
            rot += step
        }
        ctx.lineTo(cx, cy - outerRadius)
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    const outlineHeart = ctx => {
        ctx.beginPath();
        ctx.scale(.3, .3);
        ctx.lineWidth = 10;
        ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
        ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
        ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
        ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
        ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
        ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
        ctx.stroke();
        ctx.closePath();
    }

    const recSizes = [[20, 5], [15, 5], [15, 10]]
    const makeRec = ctx => {
        ctx.beginPath();
        let [x, y] = recSizes[Math.floor(Math.random() * recSizes.length)]
        ctx.rect(0, 0, x, y);
        ctx.fill()
    }

    const SHAPES = [makeStar, makeHeart, outlineHeart, null, makeRec]
    return (
        <Confetti
            recycle={false}
            numberOfPieces={140}
            colors={COLORS[Math.floor(Math.random() * COLORS.length)]}
            // gravity={0.1}
            // initialVelocityY={10}
            // opacity={0.6}
            // tweenDuration={7000}
            drawShape={SHAPES[Math.floor(Math.random() * SHAPES.length)]}
        // drawShape={makeRec}

        />
    );
}

export default CallOnConfeti;