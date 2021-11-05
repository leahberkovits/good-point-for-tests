import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './CSS/scroll_button.scss'

const ScrollBackUp = (props) => {
    return (
        <FontAwesomeIcon className="all-purpose-buttons" id={props.id} icon={props.icon} onClick={
            () => {
                if (!props.elem) return;
                props.options ? props.elem.scrollTo(props.options) : ((props.x !== undefined && props.y !== undefined) ? props.elem.scrollTo(props.x, props.y) : console.log("properties given r so wrong"))
            }}
        />

    );
}

export default ScrollBackUp;