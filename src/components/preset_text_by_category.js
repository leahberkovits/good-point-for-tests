import React from 'react';
import { observer, inject } from "mobx-react"
import Radio from '@material-ui/core/Radio';
import { RadioGroup } from '@material-ui/core';
import { translate } from '../translation/GPi18n';

import './CSS/preset_text_by_category.scss'

class PresetTextByCategory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: Array((this.props.PresetMessagesStore.presetMessages && this.props.PresetMessagesStore.presetMessages.length) || 7).fill(false)
        }
        this.presetMsgs = undefined;
        // this.pmsText = undefined;
    }


    changeChecked = (index) => {
        let arr = this.state.checked;
        let bool = arr[index];
        arr = arr.map(() => { return false })
        arr[index] = !bool;
        this.setState({ checked: arr })
    }

    changeCheckedToFlase = () => {
        let arr = this.state.checked;
        arr = arr.map(() => { return false })
        this.setState({ checked: arr })
    }

    handlePresetClick = (e, index) => {
        this.changeChecked(index);
        this.props.addPresetToInputValue(e.target.value);
    }

    render() {
        // returns the preset messages according to selected category

        if (this.props.checkedToFalse) { this.changeCheckedToFlase() }
        // this.props.PresetMessagesStore.prevCateg = 'noprevcateg';
        this.presetMsgs = this.props.PresetMessagesStore.presetMessagesByCategoryAndGender;
        if (!this.presetMsgs) {
            this.presetMsgs = "loading ... "
        }
        else if (!this.presetMsgs.length) {
            this.presetMsgs = this.props.t("alerts.no_sen_in_c")
        } else {
            this.presetMsgs = this.presetMsgs.map((pm, index) => {
                return <div key={pm.id}>
                    <RadioGroup key={pm.id} id="radio_container" row >
                        <label className="pointer" > <Radio direction="row" id={JSON.stringify(index)} className="radio" value={pm.text} checked={this.state.checked[index]} onClick={(e) => { this.handlePresetClick(e, index) }} />
                            {pm.text} </label>
                    </RadioGroup> </div>
            })
        }

        return <div id="list_sentences">
            {this.presetMsgs}
        </div>
    }
}


export default translate(inject("PresetMessagesStore")(observer(PresetTextByCategory)));