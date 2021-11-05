import React, { useEffect } from 'react';

import { inject, observer } from 'mobx-react'

import { Button, TextField } from '@material-ui/core';
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';

import './CSS/change_pw_form.scss'
import { useTranslate } from '../translation/GPi18n';
import { regexes } from '../consts/consts';



const theme = createMuiTheme({
    direction: 'rtl',
    overrides: {
        MuiInputLabel: { // Name of the component 
            root: { // Name of the rule
                "&$focused": { // increase the specificity for the pseudo class
                    color: "grey" //grey for the label (name of field)
                }
            }
        },
        MuiOutlinedInput: {
            root: {
                '&$focused $notchedOutline': {
                    borderColor: 'grey'
                },
            }
        }
    }
});

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
            width: "80%"
        },
    },
    // fieldColor: { // color of the border on text field
    // "& .MuiOutlinedInput-root": {
    // "&.Mui-focused fieldset": {
    // borderColor: "grey"
    // }
    // }
    // }
}));


const fields = { OLD_PASS: 'OLD_PASS', NEW_PASS_1: "NEW_PASS_1", NEW_PASS_2: "NEW_PASS_2", GENERAL: "GENERAL" };
// added to regexes in consts.js // const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/

const ResetForm = (props) => {
    const { t } = useTranslate();
    const classes = useStyles();


    let [errs, setErrs] = React.useState([])
    let [helperText, setHelperText] = React.useState([])

    let [oldPassVal, setOldPassVal] = React.useState(false)
    let [newPass1Val, setNewPass1Val] = React.useState(false)
    let [newPass2Val, setNewPass2Val] = React.useState(false)


    useEffect(() => {
        clearErrs()
    }, [])


    const clearErrs = () => {
        setErrs([])
        setHelperText([])
    }


    const setErrOnField = (field, msg = false, removeMsg = false) => { // todo check removeMsg didnt ruin 
        if (!Object.values(fields).includes(field)) return;
        // diaplays an error on given field and if got a msg will also set the helper text for error explanation
        let errsTemp = [...errs]
        errsTemp[field] = removeMsg ? false : true
        setErrs(errsTemp)
        if (msg) {
            let htTemp = [...helperText]
            htTemp[field] = msg
            setHelperText(htTemp)
        }
    }

    const handleEndOfPass1Write = () => {
        if (!newPass1Val || !newPass1Val.length) {
            return;
        }
        //check if oldPass === newPass1
        if (oldPassVal === newPass1Val) {
            setErrOnField(fields.NEW_PASS_1, t("errors.reset_p.diff_p"))
            return;
        }
        (async () => {
            const validPW = regexes.PASSWORD.test(newPass1Val)
            if (!validPW) {
                setErrOnField(fields.NEW_PASS_1, t("errors.reset_p.valid_p"))
            }
        })();
        setErrOnField(fields.NEW_PASS_1, false, true); //todo check removeMsg
    }

    const handleSubmit = async () => {
        //! this is after merge admin with translate on translate branch, which overrid some important scss!
        if (!oldPassVal || !oldPassVal.length) {
            setErrOnField(fields.OLD_PASS);
            return;
        }
        if (!newPass1Val || !newPass1Val.length) {
            setErrOnField(fields.NEW_PASS_1)
            return;
        }
        if (!newPass2Val || !newPass2Val.length) {
            setErrOnField(fields.NEW_PASS_2)
            return;
        }
        //all fields are NOT empty-- have value
        //check if oldPass === newPass1
        if (oldPassVal === newPass1Val) {
            setErrOnField(fields.NEW_PASS_1, t("errors.reset_p.new_p"))
            return;
        }
        //check if wanted newPass is valid
        if (!regexes.PASSWORD.test(newPass1Val)) {// if not valid
            setErrOnField(fields.NEW_PASS_1, t("errors.reset_p.Az1"))
            return;
        }
        //check if NEW_PASS_1 is the same as NEW_PASS_2
        if (newPass1Val !== newPass2Val) {
            setErrOnField(fields.NEW_PASS_2, t("errors.reset_p.no_match"))
            return;
        }

        //all good - let's change it
        props.UsersStore.resetPW(oldPassVal, newPass1Val, err => {
            if (!err) { setErrOnField(fields.GENERAL, t("login.change_succ")); return; }
            if (err.error && err.error.message) {
                const errSplit = err.error.message.split(';')
                if (errSplit && errSplit.length && Object.values(fields).includes(errSplit[0])) {
                    if (errSplit.length === 2)
                        setErrOnField(errSplit[0], errSplit[1])
                    else
                        setErrOnField(errSplit[0])
                    return;
                }
            }
            setErrOnField(fields.GENERAL, t("try_again_later"))
        })
    }

    return (
        <div id="resetPW-form-container">
            <ThemeProvider theme={theme}>
                <div className="textsContainer">
                    <form className={`${classes.root} resetPW-form`} >
                        <TextField
                            className={classes.fieldColor}
                            error={errs[fields.OLD_PASS]}
                            helperText={helperText[fields.OLD_PASS]}
                            onChange={(e) => { clearErrs(); setOldPassVal(e.target.value) }}
                            variant="outlined"
                            id="oldPW1"
                            label={t("login.current_p")}
                        />

                        <TextField
                            className={classes.fieldColor}
                            onBlur={handleEndOfPass1Write}
                            error={errs[fields.NEW_PASS_1]}
                            helperText={helperText[fields.NEW_PASS_1]}
                            onChange={(e) => { clearErrs(); setNewPass1Val(e.target.value) }}
                            variant="outlined"
                            id="newPW1"
                            label={t("login.new_p")}
                        />
                        <TextField
                            className={classes.fieldColor}
                            error={errs[fields.NEW_PASS_2]}
                            helperText={helperText[fields.NEW_PASS_2]}
                            onChange={(e) => { clearErrs(); setNewPass2Val(e.target.value) }}
                            variant="outlined"
                            id="newPW2"
                            label={t("login.new_p")}
                        />
                        {errs[fields.GENERAL] && helperText[fields.GENERAL] && helperText[fields.GENERAL].length ? <p id="generalErr">{helperText[fields.GENERAL]}</p> : null}
                    </form>
                    <Button id="change-pw-btn" onClick={handleSubmit} variant="outlined" >{t("login.update_p")}</Button>
                </div>
            </ThemeProvider>
        </div >
    );
}

export default inject("UsersStore")(observer(ResetForm));
