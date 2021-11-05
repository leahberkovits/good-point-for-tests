import React from 'react';
import { observer, inject } from "mobx-react"

import Greeting from '../components/HomePageFolder/greeting.js'
import MyActivity from '../components/HomePageFolder/my_activity';
import SendAGoodPointButton from '../components/send_a_good_point_button';
import ScrollBackUp from '../components/scroll_button'
import SwipeableTemporaryDrawer from '../components/HomePageFolder/navbar'

import FirstLoginMessages from '../components/first_login_messages.js';

import { PWA, AddToHomeScreen } from '../components/pwa';


import '../components/CSS/PagesCSS/home_page.scss'




class HomePage extends React.Component {
    constructor(props) {
        super(props);
        PWA.listeners()
        this.state = {
            scrollDownButton: false,
            endMsgClass: true,
            adminPopup: null,
            pwaOpen: PWA.checkIfNotPWA()
        }
    }

    setPWAOpen = value => this.setState({ pwaOpen: value })

    handleGPsScroll = (e) => { //for scrollbutton down - could move to gpbymonth comp - the scroll button too maybe
        e.target.scrollTop > 100 ? this.setState({ scrollDownButton: true }) : this.setState({ scrollDownButton: false })
    }

    componentDidMount() {
        const { firstLogin, removeBubble, closeFirstLoginMessages } = this.props.UsersStore;
        if (firstLogin && closeFirstLoginMessages && !removeBubble) { //first login popup was closed (we're in didMount for coming back from resetPassword page) , so need to start a 10s timer for GP bubble
            this.props.UsersStore.removeSendAGPBubble(10000)
        }

        this.props.GoodPointsStore.scrollStudentsListQuestionMark = false
    }


    render() {
        const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
        const onMobile = toMatch.some(toMatchItem => navigator.userAgent.match(toMatchItem));

        const { closeFirstLoginMessages, fullName, firstLogin, isAdmin, firstAdminLogin, removeBubble } = this.props.UsersStore;

        return <div >
            {onMobile && (closeFirstLoginMessages || (!firstLogin && !firstAdminLogin)) ? <AddToHomeScreen open={this.state.pwaOpen} setOpen={this.setPWAOpen} /> : null} {/* when first login... */}
            <SwipeableTemporaryDrawer isAdmin={isAdmin} />
            <div id="home-page-container">
                <Greeting fullName={fullName} />
                <MyActivity handleGPsScroll={this.handleGPsScroll} endMsgClass={this.state.endMsgClass} />
                <SendAGoodPointButton withBubble={firstLogin && !removeBubble} onSendAGPBtnClick={this.handleSendAGPBtnClick} />
                {this.state.scrollDownButton && <ScrollBackUp id="up-button" icon={'arrow-up'} elem={document.getElementById('home-page-container')} x={0} y={0} />}

                {closeFirstLoginMessages ? null : <FirstLoginMessages onFirstLoginMessageClose={this.handleFirstLoginMessageClose} />}
            </div>
        </div>
    }

}

export default inject("GoodPointsStore", "UsersStore")(observer(HomePage));
