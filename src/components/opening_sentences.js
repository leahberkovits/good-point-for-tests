import React, { useEffect } from 'react'
import { observer, inject } from "mobx-react"
import { useTranslate } from '../translation/GPi18n'

import { GeneralAlert } from '../generic-components/client_teacher_general_alerts';
import OpeningSentencesForm from './opening_sentences_form'

import GenderOptionsLowerCased from '../consts/GenderOptionsLowerCased'
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Presetcategories from '../consts/PresetCategories'

import './CSS/opening_sentences.scss'

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={0}>{children}</Box>}
        </Typography>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

const a11yProps = index => {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

const useStyles = makeStyles(theme => ({
    root: {
        top: "27vw",
        width: "100vw",
        position: "fixed"
    },
    typography: {
        fontFamily: 'Heboo'
    },
}));


const TO_BOTTOM = 1;
function OpeningSentences(props) {
    const { t } = useTranslate();
    const classes = useStyles();
    const theme = useTheme();
    const [value, setValue] = React.useState(0);
    const [showInput, setShowInput] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const [formClass, setFormClass] = React.useState(false)
    const [formButtonClass, setFormButtonClass] = React.useState(false)
    const [addInputClick, setAddInputClick] = React.useState(false)

    //alert :
    let alertTO = null;
    const [showAlert, setShowAlert] = React.useState(false)
    //alert ^

    const withInstructions = props.UsersStore.firstOpeningSentences;

    const handleStyleOnAddInputClick = () => {
        setAddInputClick(true)
        setTimeout(() => { setAddInputClick(false) }, 40)
    }

    useEffect(() => {
        setTimeout(() => {
            document.getElementById("osFormInstructions") && document.getElementById("osFormInstructions").classList.remove("slide-in-bottom1")
        }, 3000)
    }, [])

    //alert :
    const closeAlert = () => { setShowAlert(false) }
    const openGenAlertSync = async (obj) => {
        if (typeof obj !== "object" || Array.isArray(obj)) return;
        clearTimeout(alertTO)
        return await new Promise((resolve, reject) => {
            const popupCb = res => { resolve(res) }
            const alertObj = { text: obj.text, warning: obj.warning || false, block: obj.block || false, noTimeout: obj.noTimeout || false }
            if (obj.isPopup) alertObj.isPopup = { ...obj.isPopup, popupCb, closeSelf: () => { setShowAlert(false) } }
            setShowAlert(alertObj)
            if (!obj.isPopup && !obj.noTimeout) alertTO = setTimeout(closeAlert, 5000)
        })
    }
    //alert ^

    const scrollCurrentOSList = (toWhere) => {
        const lists = props.sentencesContainer.current.rootNode.firstElementChild.children;
        let scrollablelist;
        let smoothFlag = false;
        for (let i = 0; i < lists.length; i++) {
            !smoothFlag && (lists[i].style.scrollBehavior = "smooth");
            ((lists[i].attributes[0].value === "false") && (!scrollablelist)) && (scrollablelist = lists[i])
        }
        smoothFlag = true;
        scrollablelist.scrollTop = toWhere === TO_BOTTOM ? scrollablelist.scrollHeight : 0
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = index => {
        setValue(index);
        switch (index) {
            case 0:
                handleCategClick(Presetcategories.SOCIAL);
                break;
            case 1:
                handleCategClick(Presetcategories.EMOTIONAL)
                break;
            case 2:
                handleCategClick(Presetcategories.EDUCATIONAL)
                break;
            case 3:
                handleCategClick(Presetcategories.OTHER)
                break;
            default:
                handleCategClick(Presetcategories.SOCIAL);
        }
    };
    const validationInput = () => { // will return false if the input is not valid and true if it is. will also set the os error message when not valid
        let osFormError = '';
        let selectedGender = props.PresetMessagesStore.selectedGender;

        if ((!inputValue || typeof inputValue !== "string" || !inputValue.length) || !(/\S/.test(inputValue => inputValue))) { //input is empty
            osFormError = t("validation.write");
            props.PresetMessagesStore.setOsFormError(osFormError); //will display the error on screen
            return false;
        }
        else {
            if (selectedGender.length < 1) { // no gender was selected // not relevent when "ללא" is selected as default
                osFormError = t("alerts.write_g");
                props.PresetMessagesStore.setOsFormError(osFormError); //will display the error on screen
                return false;
            }
            else if (selectedGender !== GenderOptionsLowerCased.NONE) { // make sure input contains "התלמיד/ה" only once
                let theMagicWord = t("opennings_msg.the_student_F")
                if (selectedGender === GenderOptionsLowerCased.MALE) {
                    theMagicWord = t("opennings_msg.the_student_M")
                    let girlMagicWordInMale = inputValue.match(t("opennings_msg.the_student_F")) || []; //does it appear in input value?
                    let girlMagicWordInMaleCount = girlMagicWordInMale.length;
                    if (girlMagicWordInMaleCount > 0) {
                        osFormError = t("opennings_msg.cant_F")
                        props.PresetMessagesStore.setOsFormError(osFormError); //will display the error on screen
                        return false;
                    }
                }
                let regex = new RegExp(theMagicWord, "g"); // התלמיד / התלמידה 
                let magicWordsInInput = inputValue.match(regex) || []; //does it appear in input value?
                let wordCount = magicWordsInInput.length;
                if (wordCount === 0) {
                    osFormError = `${t("opennings_msg.in_order_include")} '${theMagicWord}'`;
                    props.PresetMessagesStore.setOsFormError(osFormError); //will display the error on screen
                    return false;
                }
                if (wordCount > 1) {
                    osFormError = `${t("opennings_msg.please_put")} ${theMagicWord} ${t("opennings_msg.only_once")} `;
                    props.PresetMessagesStore.setOsFormError(osFormError); //will display the error on screen                }
                    return false;
                }

            } else {
                let includes = null; //does not include. if will turn true (==includes התלמידה ) if will turn false (==includes התלמיד)
                inputValue.includes(t("opennings_msg.the_student_F")) ? (includes = true) : (inputValue.includes(t("opennings_msg.the_student_M")) && (includes = false))
                if (includes !== null) {
                    osFormError = `${t("opennings_msg.if_you_want")}${includes ? t("genders.female") : t("genders.male")}, ${t("opennings_msg.please_do")}`;
                    props.PresetMessagesStore.setOsFormError(osFormError); //will display the error on screen                }
                    return false;
                }
            }
        }
        return true;
    }


    const handleInputClose = () => {
        setFormButtonClass(true);
        setFormClass(false)
        setTimeout(() => { setShowInput(false) }, 400)
        setInputValue('')
        scrollCurrentOSList();
    }
    const handleCategClick = (categ) => {
        setShowInput(false)
        props.PresetMessagesStore.selectedCateg = categ;
        props.PresetMessagesStore.setOsFormError('');
    }
    const changeValue = (e) => {
        props.PresetMessagesStore.setOsFormError(''); // TO DO -shani- יש צורך בבדיקה סימן שאלה(אם אין בעיה אז לא צריך לאפס אותה
        setInputValue(e.target.value)
    }
    const addInput = () => {
        scrollCurrentOSList(TO_BOTTOM);
        setFormClass(true);

        props.PresetMessagesStore.selectedGender = GenderOptionsLowerCased.NONE;
        setInputValue('')

        setTimeout(() => {
            setShowInput(showInput => !showInput)
        }, 150); //for add-input-btn to disappear
    }

    const handleSubmit = async (e) => {
        try { e && typeof e.preventDefault === "function" && e.preventDefault(); } catch (err) { }
        if (validationInput()) {
            setShowInput(false)
            removeOSInstruc()
            await props.PresetMessagesStore.postPresetMessage(inputValue);
            setInputValue('')
            scrollCurrentOSList(TO_BOTTOM);
        }
    }
    const deleteMessage = async (e, pmId) => {
        var element = e.target.parentNode;
        let del = await openGenAlertSync({ text: t("opennings_msg.delete"), isPopup: { okayText: t("opennings_msg.yes_del"), cancelText: t("cancel") } })
        if (!del) return;
        let deleted = await props.PresetMessagesStore.deletePresetMessage(pmId)
        if (!deleted) return;
        element.classList.add("deleted-os")
        element.classList.remove('new-pm-animation')
        setTimeout(() => {
            element.classList.remove("deleted-os")
        }, 400)
    }

    let presetMsgs = props.PresetMessagesStore.openingSentencesByCateg;
    if (!presetMsgs || presetMsgs === null) { presetMsgs = <div dir="rtl">{t("loading")}</div> }
    else if (presetMsgs.length < 1) { presetMsgs = <div>{`${t("errors.not_found")} ${t("opennings")}`}</div> }
    else {
        let magicWord;
        let newText;
        presetMsgs = presetMsgs.map((pm, index) => {
            let pmId = pm.id
            let isNewPm = pm.new;
            delete pm.new;
            newText = pm.text;
            if (pm.gender.toLowerCase() !== GenderOptionsLowerCased.NONE) {
                magicWord = pm.gender.toLowerCase() === GenderOptionsLowerCased.FEMALE ? t("opennings_msg.the_student_F") : t("opennings_msg.the_student_M");
                let pmArr = pm.text.split(" ")
                const magicWordIndex = pmArr.indexOf(magicWord)
                if (!magicWordIndex) newText = <div>{pm.text}</div>
                newText = <div>
                    {pm.text.split(magicWord)[0]}
                    <span style={{ color: "grey" }}>{`${magicWord} `}</span>
                    {pm.text.split(magicWord)[1]}
                </div>
            }

            return (<div key={pmId} >
                {index > 0 && <div className="d-flex justify-content-center">
                    <hr id="formHr" />
                </div>} {/* hr s only between the pms */}
                <div className={`${isNewPm ? "new-pm-animation" : ''} d-flex justify-content-between`} id="opening-sentence">
                    <img src="/images/x-icon.svg" alt="cancel" className="ml-4" onClick={(e) => { deleteMessage(e, pmId) }} id="delete-msg" />
                    <div className="mr-4" id="text-of-gp">{newText}</div>
                </div>
            </div>
            );
        })
    }

    const removeOSInstruc = () => {
        props.UsersStore.removeInstrucBubbleOS()
    }

    return (
        <div className={classes.root} id="p">
            <AppBar position="static" color="default">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    scrollButtons="off"
                    aria-label="full width tabs example"
                // handleCategClick={handleCategClick}
                >
                    <Tab label={t("send_gp.social")} {...a11yProps(0)} onClick={() => { handleCategClick(Presetcategories.SOCIAL) }} />
                    <Tab label={t("send_gp.emotional")} {...a11yProps(1)} onClick={() => { handleCategClick(Presetcategories.EMOTIONAL) }} />
                    <Tab label={t("send_gp.edu")} {...a11yProps(2)} onClick={() => { handleCategClick(Presetcategories.EDUCATIONAL) }} />
                    <Tab label={t("send_gp.other")} {...a11yProps(3)} onClick={() => { handleCategClick(Presetcategories.OTHER) }} />
                </Tabs>
            </AppBar>
            <div id="osFormInstructions">
                <SwipeableViews
                    axis={theme.direction === 'ltr' ? 'x-reverse' : 'x'}
                    index={value}
                    onChangeIndex={handleChangeIndex}
                    id="opening-sentences-list"
                    ref={props.sentencesContainer}
                    style={{ height: 'fit-content' }}
                >
                    <TabPanel value={value} index={0} dir={theme.direction} >
                        {presetMsgs}
                    </TabPanel>
                    <TabPanel value={value} index={1} dir={theme.direction} >
                        {presetMsgs}
                    </TabPanel>
                    <TabPanel value={value} index={2} dir={theme.direction}>
                        {presetMsgs}
                    </TabPanel>
                    <TabPanel value={value} index={3} dir={theme.direction}>
                        {presetMsgs}
                    </TabPanel>
                </SwipeableViews>

                {showInput ? <div id="osFormPos"><OpeningSentencesForm removeOSInstruc={removeOSInstruc} firstOS={withInstructions} formClass={formClass} handleInputClose={handleInputClose} changeValue={changeValue} handleSubmit={handleSubmit} inputValue={inputValue} /></div>
                    : <div className={formButtonClass ? "d-flex justify-content-start back-in-os-form-button-animation" : "d-flex justify-content-start"} id="addOSBtn">
                        <button id="add-button" className={`${addInputClick ? "add-button-clicked" : "add-button-not-clicked"} mt-4 mr-4`} onClick={() => { addInput() }} onTouchStart={handleStyleOnAddInputClick} >+ {t("opennings_msg.add")}</button>
                    </div>}

                {withInstructions ? (!showInput ? //first instruc block- when input is closed
                    <div className="instructions-container" id="instructions-container1" >
                        <div className="bubbleBody" id="bubbleBody1" >
                            <div onClick={() => { addInput() }} onTouchStart={handleStyleOnAddInputClick} className="text" id="text"> {t("explaintions.open.opening")}</div>
                        </div>
                    </div>
                    :
                    <div className="instructions-container" id="instructions-container2" >
                        <div className="bubbleBody" id="bubbleBody2" >
                            <div className="text" id="text2">{t("explaintions.open.opening_help")}</div>
                            <div onClick={removeOSInstruc} id="okayBtn-for-text2">{t("got_it")}</div>
                        </div>
                    </div>
                ) : null}
            </div>
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} block={showAlert.block} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </div>
    )
}


export default inject("PresetMessagesStore", "UsersStore")(observer(OpeningSentences));