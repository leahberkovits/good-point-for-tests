import React from 'react';

import './CSS/dark_background_behind_popup.scss'

const DarkBackgroundBehindPopup = (props) => {
    if (props.closeOnClick && props.handleClick)
        return (<div ref={props.backgroundDiv} onClick={props.handleClick} className="background-fade-in" id="background-container-div" ></div>);
    return (<div ref={props.backgroundDiv} className="background-fade-in" id="background-container-div" ></div>);
}

export default DarkBackgroundBehindPopup;