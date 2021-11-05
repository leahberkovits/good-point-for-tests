import React, { Component } from 'react';
import { observer, inject } from "mobx-react"
import '../CSS/set-username-and-pass.scss'



class SetUsernameAndPass extends Component{
    constructor(props){
        super(props);
        this.state = {
            show:  false
        }
    }
    render(){
        if (this.props.GoodPointsStore.signUp === true) {
            this.state.show = true
        } else {
            this.state.show = false
        }
        return (
            <div id="setUsernameAndPass">
            <form className={` ${this.state.show ? "scale-in-animation" : "scale-out-animation"} `} /* onSubmit={this.sdfjkahdsfkj} */ >
                <div className='form-group'>
                    <input id="username" className="form_field" type='text' placeholder={t("login.set_name")} required />
                </div>
                <div className='form-group'>
                    <input id="password"  className="form_field" type='password' placeholder={t("login.set_psw")} required />
                    <input id="password"  /* onKeyPress={(e) => { (e.key.toLowerCase() === "enter") && this.handleLogin(e) }} */ className="form_field" type='password' ref='pw' placeholder={t(login.enter_psw)} required />
                </div>
                <div className='form-group'>
                        <button id="submit" /* onClick={this.handleLogin} */ type='button'>{t("login.enter")}</button>
                </div>
            </form>
            </div>
        );
    }
}
   
export default inject("GoodPointsStore")(observer(SetUsernameAndPass));
