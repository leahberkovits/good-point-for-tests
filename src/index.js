import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

//boostrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
//rtl material
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@material-ui/styles';
import { Provider } from 'mobx-react';
import stores from './stores/index';
//font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

// general alert context provider
import { GenAlertProvider } from './contexts/generalAlertCtx.jsx';
import { ConstsProvider } from './contexts/constsContext';
import { I18nextProvider } from 'react-i18next';
import myI18Next from './translation/GPi18n'
library.add(fas);


const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
const onMobile = toMatch.some(toMatchItem => navigator.userAgent.match(toMatchItem));

const vhLS = localStorage.getItem('vh');
let currVH = window.innerHeight / 100;
const currVW = window.innerWidth / 100;
if (onMobile && currVW > currVH)
    currVH = currVW

if (vhLS) {
    document.documentElement.style.setProperty('--vh', Math.max(vhLS, currVH) + "px");
} else {
    localStorage.setItem('vh', currVH)
    document.documentElement.style.setProperty('--vh', `${currVH}px`);
}
document.documentElement.style.setProperty('--vw', `${window.innerWidth / 100}px`);

window.addEventListener('orientationchange', function () {
    // switch between vh and vw
    let vh = document.documentElement.style.getPropertyValue("--vh");
    let vw = document.documentElement.style.getPropertyValue("--vw");
    document.documentElement.style.setProperty('--vh', vw);
    document.documentElement.style.setProperty('--vw', vh);
});

window.addEventListener('resize', () => {
    // ! remove before deployment !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! REMOVE BEFORE DEPLOYMENT (for when keyboard is open)
    // get current window innerHeight and innerWidth, to reset the page instead of needing to refresh (e.g when opening the inspect f12)
    document.documentElement.style.setProperty('--vh', `${window.innerHeight / 100}px`);
    document.documentElement.style.setProperty('--vw', `${window.innerWidth / 100}px`);
})


ReactDOM.render(
    <Provider  {...stores}>
        <StylesProvider jss={jss}>
            <I18nextProvider i18n={myI18Next}>
                <ConstsProvider>
                    <GenAlertProvider>
                        <App onMobile={onMobile} />
                    </GenAlertProvider>
                </ConstsProvider>
            </I18nextProvider>
        </StylesProvider>
    </Provider>
    , document.getElementById('root'));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();