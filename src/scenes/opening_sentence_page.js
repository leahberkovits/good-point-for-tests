import React from 'react';

import { observer, inject } from "mobx-react"

import Top from '../components/top'
import OpeningSentences from '../components/opening_sentences';
import PresetCategoriess from '../consts/PresetCategories';
import SwipeableTemporaryDrawer from '../components/HomePageFolder/navbar'
import { translate } from '../translation/GPi18n';

class OpeningSentencePage extends React.Component {
    constructor(props) {
        super(props);
        this.sentencesContainer = React.createRef();
    }

    componentDidMount() {
        this.props.PresetMessagesStore.selectedCateg = PresetCategoriess.SOCIAL;
    }


    render() {
        // if (window.cordova && window.cordova.plugins.Keyboard) {
        // window.cordova.plugins.Keyboard.disableScroll(true);
        // }
        return <div id="opening_sentences_div" >
            <SwipeableTemporaryDrawer isAdmin={this.props.UsersStore.isAdmin} />
            <Top applyNavbarPageStyle={true} text={this.props.t("opennings")} />
            <OpeningSentences sentencesContainer={this.sentencesContainer} />
        </div>
    }

}

export default translate(inject("PresetMessagesStore", "UsersStore")(observer(OpeningSentencePage)));
