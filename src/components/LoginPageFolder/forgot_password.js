import React from 'react';
import { Dialog, DialogTitle, Button, DialogContent, DialogActions } from '@material-ui/core';
import '../CSS/reset_password.scss'
import Login from '../../modules/auth/Login.jsx'
import { observer, inject } from "mobx-react"
import { translate } from '../../translation/GPi18n';

class ResetPassword extends Login {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            resetPassOpen: false
        }
    }
    openForm(event) {
        const t = this.props.t;

        event.target.innerHTML = event.target.innerHTML === t("cancel") ? t("login.forgot_p") : t("cancel")


        this.props.GoodPointsStore.changePassOpen(event.target.innerHTML === t("cancel"))
        this.setState({ emailInputOpen: event.target.innerHTML === t("cancel") })
    }
    render() {
        const t = this.props.t;
        return (

            <div id="reset-password-second-container">
                <div className="collapse multi-collapse" id="resetPWForm">
                    <form onSubmit={this.reset} >
                        <input ref="resetEmailInput" dir="ltr" id="resetField" type="email" className="form-control login_input" placeholder={t("login.email")} required />
                        <button type="submit" id="resetSubmit" className="btn login_input mt-3" >
                            {t("login.reset_p")}
                        </button>
                    </form>
                </div >

                <p>
                    <button className={`${this.state.resetPassOpen ? "form-opened" : "form-closed"} btn btn-link login_input`} id="resetBtn" type="button" data-toggle="collapse" href="#resetPWForm" delay='0.5s' aria-expanded="false" aria-controls="resetPWForm"
                        onClick={(event) => { this.openForm(event) }} >
                        {t("login.forgot_p")}
                    </button>
                </p>
                <br />

                <Dialog open={this.state.resetPassDialog} aria-labelledby="reset-modal">
                    <DialogTitle id="reset-modal" className="float-right" >
                        <p id="resetPass">{t("login.change_p")}</p>
                    </DialogTitle>

                    <DialogContent>
                        {this.state.resetPassMsg}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ resetPassDialog: false })} children={t("got_it")} color="primary" />
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
export default translate(inject("GoodPointsStore")(observer(ResetPassword)));