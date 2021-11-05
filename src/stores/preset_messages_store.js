import { observable, decorate, action, computed, runInAction } from 'mobx';

import Auth from '../modules/auth/Auth';

import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'

import PresetCategories from '../consts/PresetCategories';
import { getLanguage, getT } from '../translation/GPi18n';
const t = getT();


class PresetMessagesStore {

    cnt = {};
    error = t("alerts.can't_load_info");
    presetMsgsList = null;
    selectedCateg = 'social';
    selectedGender = GenderOptionsLowerCased.NONE;
    studentGender = '';
    studentName = '';
    osFormError = '';

    //superadmin
    superadminPMsList = null;

    setOsFormError(error) {
        runInAction(() => {
            this.osFormError = error
        })
    }

    get getOsFormError() {
        return this.osFormError;
    }

    async fetchPresetMessages() {
        let [res, err] = await Auth.superAuthFetch("/api/PresetMessages/getMyPresetMessages", null, true);
        if (err) {
            this.cnt["fetchPresetMessages"] ? this.cnt["fetchPresetMessages"]++ : this.cnt["fetchPresetMessages"] = 1;
            if (this.cnt["fetchPresetMessages"] < 3) {
                setTimeout(() => { this.fetchPresetMessages() }, 5000);
                return;
            }
        }
        else {
            runInAction(() => {
                this.presetMsgsList = res.presetMessages;
            });
            setTimeout(() => { runInAction(() => { this.presetMsgsList = null }) }, 1000 * 60 * 60 * 24) //in 24hrs, from preset messages fetch.
        }
    }

    async postPresetMessage(text) {
        if (!text || typeof text !== "string" || !text.length) return false
        let currSelectedCateg = this.selectedCateg;
        let currGender = this.selectedGender;
        let [res, err] = await Auth.superAuthFetch(`/api/PresetMessages/addAPm?text=${text}&presetCategory=${currSelectedCateg}&gender=${currGender}`, null, true, true);
        if (err) {
            this.cnt["postPresetMessage"] ? this.cnt["postPresetMessage"]++ : this.cnt["postPresetMessage"] = 1;
            if (this.cnt["postPresetMessage"] < 3) {
                setTimeout(() => { this.postPresetMessage(text) }, 5000);
                return;
            }
            return false
        }
        res = res.pm;
        runInAction(() => {
            this.osFormError = '';
            this.selectedGender = GenderOptionsLowerCased.NONE
        });
        this.presetMsgsList = this.presetMsgsList.map(pm => {
            let newpm = pm;
            if (pm.new) {
                newpm.new = false;
            }
            return newpm;
        })
        this.presetMsgsList.push({ ...res, new: true, presetCategory: currSelectedCateg, gender: currGender, text: text, id: res.id });
        return true;
    }

    async deletePresetMessage(pmId) {
        let [res, err] = await Auth.superAuthFetch(`/api/PresetMessages/deletePersonalPresetMessage?pmId=${pmId}`, null, true, true)
        if (err) {
            this.cnt["deletePresetMessage"] ? this.cnt["deletePresetMessage"]++ : this.cnt["deletePresetMessage"] = 1;
            if (this.cnt["deletePresetMessage"] < 3) {
                setTimeout(() => { this.deletePresetMessage(pmId) }, 5000);
                return;
            }
            return;
        }
        setTimeout(() => {
            runInAction(() => { this.presetMsgsList = this.presetMsgsList.filter(pm => pm.id !== pmId) }); //remove deleted pm from screen
        }, 400)
        return true;
    }

    get openingSentencesByCateg() {
        //returns preset messages to the opening sentences comp -> filter for relevent category
        (async () => {
            if (this.presetMsgsList === null) {
                await this.fetchPresetMessages();
            }
        })();
        if (this.presetMsgsList === null) return null;
        const lang = getLanguage();
        return this.presetMsgsList.filter(pm => pm.presetCategory === this.selectedCateg && pm.lang === lang)
    }

    get presetMessagesByCategoryAndGender() {
        // returns preset messages to the preset keyboard -> filters for relevent gender and category
        (async () => {
            if (this.presetMsgsList === null) {
                await this.fetchPresetMessages();
            }
        })();
        if (this.presetMsgsList === null) return null
        // if (!this.presetMsgsList.length) return "empty";

        //filter the right category and gender
        let pmFilteredListToReturn = this.presetMsgsList
        const lang = getLanguage();
        const t = getT();
        pmFilteredListToReturn = pmFilteredListToReturn.filter(pm => {
            return (pm.presetCategory === this.selectedCateg) && (pm.lang === lang) && ((pm.gender.toLowerCase() === this.studentGender.toLowerCase()) || (pm.gender.toLowerCase() === GenderOptionsLowerCased.NONE))
        });

        //change to student name
        let magicWord = this.studentGender.toLowerCase() === "male" ? t("opennings_msg.the_student_M") : t("opennings_msg.the_student_F")

        pmFilteredListToReturn = pmFilteredListToReturn.map(pm => {
            let newpm = { ...pm };
            newpm.text = newpm.text.split(magicWord).join(this.studentName);
            return newpm;
        })
        return pmFilteredListToReturn;
    }

    async systemPMs() {
        let [res, err] = await Auth.superAuthFetch(`/api/PresetMessages/systemPresetMessagesList`, null, true, true)
        if (err) {
            this.cnt["systemPMs"] ? this.cnt["systemPMs"]++ : this.cnt["systemPMs"] = 1;
            if (this.cnt["systemPMs"] < 3) {
                setTimeout(() => { this.systemPMs() }, 5000);
                return;
            }
            return;
        }
        runInAction(() => {
            this.superadminPMsList = res.presetMessages;
        });
        return true;
    }


    get superadminPMs() {
        (async () => {
            if (this.superadminPMsList === null) {
                await this.systemPMs();
            }

        })();
        return this.superadminPMsList;
    }

    async superadminDeletePM(pmId) {
        let [res, err] = await Auth.superAuthFetch(`/api/PresetMessages/deleteSystemPM`,
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ pmId }) });

        if (err) {
            return false;
        }
        runInAction(() => {
            this.superadminPMsList = this.superadminPMsList.filter(pm => pm.id !== pmId)
        })
    }

    async superadminAddPM(text, pmCategory, gender, closePopup) {
        if (!Object.values(PresetCategories).includes(pmCategory.toLowerCase()) || !Object.values(GenderOptionsLowerCased).includes(gender.toLowerCase())) {
            return false;
        }
        // const textRule = { type: 'string', format: { pattern: '[a-zA-Z0-9א-ת ,-:"._]*', flags: "i", message: "invalid chars" } } //validatetool for text
        // const success = validate.runValidate(text, textRule).success
        // if (!success) return false;

        let [res, err] = await Auth.superAuthFetch(`/api/PresetMessages/addSystemPM`,
            { method: "POST", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ text, pmCateg: pmCategory, gender: gender }) }, true);

        if (err) {
            return false;
        }
        closePopup(null);
        runInAction(() => {
            (this.superadminPMsList && this.superadminPMsList.length) ? this.superadminPMsList.push(res.newPM) : this.superadminPMsList = [res.newPM]
        })
    }

} // end of class 


decorate(PresetMessagesStore, {

    presetMsgsList: observable,
    error: observable,

    osFormError: observable,
    setOsFormError: action,
    getOsFormError: computed,

    selectedCateg: observable,
    selectedGender: observable,

    postPresetMessage: action,

    openingSentencesByCateg: computed,
    presetMessagesByCategoryAndGender: computed,

    superadminPMs: computed,
    superadminPMsList: observable,
});

let pmStore = new PresetMessagesStore;//= window.pmStore
export default pmStore;

