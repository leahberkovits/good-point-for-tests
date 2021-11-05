import React, { Component } from 'react';
import { inject, observer } from 'mobx-react'
import '../CSS/sign-up.scss'
// import Login from '../../modules/auth/Login.jsx'


class SignUp extends Component {
    constructor(props) {
        super(props);
        this.firstNameInputRef = React.createRef();
        this.lastNameInputRef = React.createRef();
        this.passwordInputRef = React.createRef();
        this.emailInputRef = React.createRef();
        this.state = {
            signUpInputOpen: false,
        }
    }
    openFormOpen(event) {
        event.target.innerHTML = event.target.innerHTML == this.props.t("cancel") ? this.props.t("sign_up.register") : this.props.t("cancel")
        if (event.target.innerHTML === this.props.t("cancel")) {
            this.props.GoodPointsStore.signUpOpen(true)
            this.setState({ signUpInputOpen: true })
        } else {
            this.props.GoodPointsStore.signUpOpen(false)
            this.setState({ signUpInputOpen: false })
        }
    }
    handleSignUp = (event) => {
        this.props.GoodPointsStore.showForm2 = true;
        //     this.props.UsersStore.signUp(
        //         this.passwordInputRef.current.value,
        //         this.emailInputRef.current.value,
        //         this.firstNameInputRef.current.value,
        //         this.lastNameInputRef.current.value)
    }
    render() {
        const changepassbtnEl = document.getElementById('chagePassBtn');
        //kayla- why not push these boolean expression inside the <button disabled={*here*} > ---> disabled={this.props.GoodPointsStore.changePass}
        if (this.props.GoodPointsStore.changePass) {
            changepassbtnEl.disabled = true;
        } else if (!this.props.GoodPointsStore.changePass && changepassbtnEl !== null) {
            changepassbtnEl.disabled = false;
        }
        return (
            <div id="sign-up-second-container">
                <div id="multi-collapse-2" className="collapse multi-collpase" >
                    <form /* onSubmit={this.reset} */ onSubmit={this.handleSignUp} >
                        <input type="text" ref={this.firstNameInputRef} id="firstNameInput" placeholder={t("signup.first_name")} required />
                        <br />
                        <input type="text" ref={this.lastNameInputRef} id="lastNameInput" placeholder={t("signup.last_name")} required />
                        <br />
                        <input type="password" ref={this.passwordInputRef} placeholder={t("psw")} required />
                        <br />
                        <input type="email" ref={this.emailInputRef} placeholder={t("login.email")} required />
                        <br />
                        <button type="submit" id="signUpSubmit" className="btn btn-link login_input" >{t("login.to_register")}</button>
                    </form>
                </div >
                <p>
                    <button className={`${this.state.signUpInputOpen ? 'on-form-closed' : 'on-form-opened'} btn btn-link login_input`} id="chagePassBtn" type="button" data-toggle="collapse" href="#multi-collapse-2" /* data-target=".collapses" */ delay='0.5s' aria-expanded="false" aria-controls="multi-collapse-2"
                        onClick={(event) => { this.openFormOpen(event) }}>
                        {t("sign_up.register")} </button>
                </p>
                <br />
            </div >
        );
    }
}

export default inject("UsersStore", "GoodPointsStore")(observer(SignUp));