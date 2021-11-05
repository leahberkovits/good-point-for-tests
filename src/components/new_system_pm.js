import React from 'react';

import { inject, observer } from 'mobx-react'

import { TextField, Select, InputLabel, FormControl, Button } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'

import { convertPresetGender, convertCateg } from '../consts/PresetCategories';

import './CSS/new_system_pm.scss'
import { useTranslate } from '../translation/GPi18n';








const NewSystemPM = (props) => {

    const { t } = useTranslate();
    const [selectedCateg, setSelectedCateg] = React.useState('');
    const [selectedGender, setSelectedGender] = React.useState('');
    const [inputVal, setInputVal] = React.useState(null);

    const [error, setError] = React.useState(null)

    const getCategories = () => {
        return ['', t("send_gp.edu"), t("send_gp.social"), t("send_gp.emotional"), t("send_gp.other")].map(cat => <option key={cat} value={convertCateg[cat]} >{cat}</option>)
    }

    const getGenders = () => {
        return ['', t("genders.without"), t("genders.male"), t("genders.female")].map(gender => <option key={gender} value={convertPresetGender[gender]} >{gender}</option>)
    }

    const handleSubmit = async () => {
        const valid = await validationInput(selectedGender, selectedCateg, inputVal, setError, t)
        valid && props.PresetMessagesStore.superadminAddPM(inputVal, selectedCateg, selectedGender, props.openPopups)
    }
    const handleCategChange = (e) => {
        setSelectedCateg(e.target.value)
    }
    const handleGenderChange = (e) => {
        setSelectedGender(e.target.value)
    }
    const handleInputChange = (e) => {
        setInputVal(e.target.value)
    }



    return (
        <div id="superadmin-add-pm">
            <h6>{t("opennings_msg.add")}</h6>
            <TextField onChange={handleInputChange} size="small" label={t("opennings_msg.the_msg")} variant="outlined" />

            <div className="new-pm-section">
                <div htmlFor="sa-categ-select">{t("opennings_msg.category")}</div>
                <Select
                    id="sa-categ-select"
                    native
                    onChange={handleCategChange}
                >
                    {getCategories()}
                </Select>
            </div>

            <div className="new-pm-section">
                <div htmlFor="sa-gender-select">{t("gender")}</div>
                <Select
                    id="sa-gender-select"
                    native
                    onChange={handleGenderChange}
                >
                    {getGenders()}
                </Select>
            </div>

            {error}

            <div className="new-pm-section">
                <Button variant="outlined" size="small" onClick={handleSubmit}> {t("add")} </Button>
                <Button variant="outlined" size="small" onClick={() => { props.openPopups(null) }}> {t("cancel")} </Button>
            </div>

        </div>
    );
}

export default inject("PresetMessagesStore")(observer(NewSystemPM));



export const validationInput = (selectedGender, selectedCateg, inputValue, setError, t) => { // will return false if the input is not valid and true if it is. will also set the os error message when not valid

    let osFormError = '';
    if (!inputValue || !(/\S/.test(inputValue))) { //input is empty
        osFormError = t("validation.write");
        setError(osFormError); //will display the error on screen
        return false;
    }
    else {
        if (!selectedGender) {
            osFormError = t("alerts.choose_g_for_sen");
            setError(osFormError); //will display the error on screen
            return false;
        }
        if (!selectedCateg) {
            osFormError = t("alerts.choose_c_for_sen");
            setError(osFormError); //will display the error on screen
            return false;
        }
        if (selectedGender !== GenderOptionsLowerCased.NONE) { // make sure input contains "התלמיד/ה" only once
            let theMagicWord = t("opennings_msg.the_student_F")
            if (selectedGender === GenderOptionsLowerCased.MALE) {
                theMagicWord = t("opennings_msg.the_student_M")
                let girlMagicWordInMale = inputValue.match(t("opennings_msg.the_student_F")) || []; //does it appear in input value?
                let girlMagicWordInMaleCount = girlMagicWordInMale.length;
                if (girlMagicWordInMaleCount > 0) {
                    osFormError = t("opennings_msg.cant_F")
                    setError(osFormError); //will display the error on screen
                    return false;
                }
            }
            let regex = new RegExp(theMagicWord, "g"); // התלמיד / התלמידה 
            let magicWordsInInput = inputValue.match(regex) || []; //does it appear in input value?
            let wordCount = magicWordsInInput.length;
            if (wordCount === 0) {
                osFormError = `${t("opennings_msg.in_order_include")} \'${theMagicWord}\'`;
                setError(osFormError); //will display the error on screen
                return false;
            }
            if (wordCount > 1) {
                osFormError = `${t("opennings_msg.please_put")} ${theMagicWord} ${t("opennings_msg.only_once")} `;
                setError(osFormError); //will display the error on screen                }
                return false;
            }

        } else {
            let includes = null; //does not include. if will turn true (==includes התלמידה ) if will turn false (==includes התלמיד)
            inputValue.includes(t("opennings_msg.the_student_F")) ? (includes = true) : (inputValue.includes(t("opennings_msg.the_student_M")) && (includes = false))
            if (includes !== null) {
                osFormError = `${t("opennings_msg.if_you_want")}${includes ? t("genders.female") : t("genders.male")}, ${t("opennings_msg.please_do")}`;
                setError(osFormError); //will display the error on screen                }
                return false;
            }
        }
    }
    setError(null); //will display the error on screen
    return true;
}
