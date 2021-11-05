import React from 'react';
import '../CSS/gp_loading.scss'

const GPLoading = (props) => {
    return (
        <div key={props.keyVal} id="loading-container" >
            <div id="loading-item" ></div>
        </div>
    );
}

export default GPLoading;