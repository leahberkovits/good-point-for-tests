import React, { Component } from 'react';
import './_Login.scss';
import Auth from '../Auth';
import { Redirect } from 'react-router';
import ValidateTool from '../../tools/ValidateTool'
import ElementsHandler from '../../../handlers/ElementsHandler'
import { Dialog, DialogTitle, Button, DialogContent, DialogActions } from '@material-ui/core';
import GenericTools from '../../tools/GenericTools'

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            redirTo: false,
            registerModal: false,
            email: { text: "", isvalid: false }, //validations texts
            username: { text: "", isvalid: false },
            password: { text: "", isvalid: false },
            realm: { text: "", isvalid: false },
            isValid: false,
            resetPassDialog: false,
            resetPassMsg: ""
        }
        this.elementsHandler = new ElementsHandler(this);
    }

    handleLogin = async (e) => {
        e.preventDefault();

        let email = this.refs.email.value;
        let pw = this.refs.pw.value;

        this.setState({ isLoading: true });

        let res = await Auth.login(email, pw);

        console.log("Auth.authenticate res", res);


        this.setState({ isLoading: false });

        if (res.success === false) {
            console.log("login failed with error", res.msg);
            return;
        }
        if (res.success === true) {
            let redir = this.props.redirectUrl || "/";
            GenericTools.safe_redirect(redir);
        }

    }

    openRegModal = () => {
        this.setState({ registerModal: !this.state.registerModal });
    }

    handleInputChange = (event) => {
        let val = event.target.value;
        if (val.length < 3) return;
        switch (event.target.id) {
            case "registerPrivateName":
                {
                    if (/[0-9]/.test(val)) {
                        event.target.value = val.substring(0, val.length - 1);
                        this.setState({ realm: { text: "Name cannot contain digits!", isvalid: false } });
                        return;
                    }
                    let part = val.split(" ");
                    if (part.length === 1) {
                        this.setState({ realm: { text: "Include family name please.", isvalid: false } });
                        return;
                    }
                    let regex = /^[a-zA-z??-??]{4,20}/;
                    if (regex.test(val)) {
                        this.setState({ realm: { text: "", isvalid: true } });
                        return;
                    }
                    else
                        this.setState({ realm: { text: "Name must be at least 4 chars and limited for 20.", isvalid: false } });
                    break;
                }
            case "registerEmail":
                {
                    let part = val.split("@");
                    if (part.length > 2) {
                        this.setState({ email: { text: "Sould contain only one @.", isvalid: false } });
                        return;
                    }
                    if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val) && !this.state.email.isvalid) {
                        this.setState({ email: { text: "", isvalid: true } });
                        return;
                    }
                    break;
                }
            case "registerUserName":
                {
                    if (/[!@#$%^&*)(_+-=)]/.test(val)) {
                        this.setState({ username: { text: "Do not include !@#$%^&*)(_+=-)", isvalid: false } });
                        return;
                    }
                    if (val.length > 16) {
                        this.setState({ username: { text: "Try shorter user-name", isvalid: false } });
                        return;
                    }
                    if (val.includes(" ")) {
                        this.setState({ username: { text: "User name cannot include blank space.", isvalid: false } });
                        return;
                    }
                    if (val.length < 16 && val.length > 3) {
                        this.setState({ username: { text: "", isvalid: true } });
                        return;
                    }
                    break;
                }
            case "registerPasswd":
                {
                    let reg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&()]).{8,18}/;

                    if (reg.test(val)) {
                        this.setState({ password: { text: "", isvalid: true } });
                        return;
                    }
                    if (!/[A-Z]/.test(val)) {
                        this.setState({ password: { text: "Password must contain at least one uppercase letter", isvalid: false } });
                        return;
                    }
                    if (!/[a-z]/.test(val)) {
                        this.setState({ password: { text: "Password must contain at least one lowercase letter (a-z)", isvalid: false } });
                        return;
                    }
                    if (!/[!@#$%^&()]/.test(val)) {
                        this.setState({ password: { text: "Password should contain one of the following carachters: !@#$%^&() ", isvalid: false } });
                        return;
                    }
                    if (!/[0-9]/.test(val)) {
                        this.setState({ password: { text: "Password must contain digits.", isvalid: false } });
                        return;
                    }
                    break;
                }
            default:
                break;
        }
    }


    register = (e) => {
        e.preventDefault();
        if (!(this.state.realm.isvalid && this.state.username.isvalid &&
            this.state.password && this.state.email.isvalid)) {
            console.log("One of the fields is invalid");
            return false;
        }
        let fd = new FormData(document.getElementById("registrationForm"));
        Auth.register(fd, 'Login successed!!');
    }


    reset = async (e) => {
        e.preventDefault();
        let email = this.refs.resetEmailInput.value;
        let [res] = await Auth.superAuthFetch('/api/CustomUsers/reset', {//can assign err if needed
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            method: "POST",
            body: JSON.stringify({ email: email, origin: window.location.origin + (window.location.hash[0] === "#" ? "/#" : "") })
        })

        this.setState({
            resetPassDialog: true,
            resetPassMsg: res ? "?????????? ?????????? ?????????? ???????????? ??????????" : "???????????? ???????? ?????????? ????????????"
        });
    }


    render() {
        if (this.state.redirTo !== false) {
            return (<Redirect to={{ pathname: '/', state: this.state }} />);

        } else
            return (
                <div className='loginPage'>

                    <div className='loginBox'>
                        <div className='frow'>
                        </div>
                        <p className="mt-1">???????????? ?????????? !</p>
                        <form onSubmit={this.handleLogin} id="logForm" className="collapses show form" data-toggle="collapse">
                            <div className='form-group'>
                                <input className="form-control" type='email' ref='email' placeholder='????????' defaultValue="admin@carmel6000.amitnet.org" required />
                            </div>
                            <div className='form-group'>
                                <input className="form-control" type='password' ref='pw' placeholder='??????????' defaultValue="E2PSzAmJ-5-ldKnl" required />

                            </div>
                            <div className='form-group'>
                                {this.state.isLoading ?
                                    <button className='btn btn-warning'>??????????...</button> :
                                    <button onClick={this.handleLogin} type='button' className='btn btn-warning login_input'  >??????????</button>
                                }
                            </div>
                        </form>

                        {/* Reset section */}
                        <div id="resetPassDiv" className="collapse collapses">
                            <form onSubmit={this.reset}>
                                <input ref="resetEmailInput" id="reset" type="email" className="form-control login_input" placeholder="Email" required />
                                <button type="submit" className="btn btn-warning login_input mt-3" >
                                    ?????? ??????????
                        </button>
                            </form>
                        </div>

                        <p>
                            <button className="btn btn-link login_input" id="toggle" type="button" data-toggle="collapse" data-target=".collapses" aria-expanded="false" aria-controls="resetPassDiv logForm" onClick={(event) => {
                                event.target.innerHTML = event.target.innerHTML === "??????????" ? '???????? ???????????' : "??????????"
                            }}>
                                ???????? ???????????
                            </button>
                        </p>

                    </div>

                    <Dialog open={this.state.resetPassDialog} aria-labelledby="reset-modal">
                        <DialogTitle id="reset-modal" className="float-right" >
                            <p style={{ float: "right", margin: "0" }}>?????????? ??????????</p>
                        </DialogTitle>

                        <DialogContent>
                            {this.state.resetPassMsg}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({ resetPassDialog: false })} children="????????" color="primary" />
                        </DialogActions>
                    </Dialog>
                    {/* End of reset section */}
                </div>
            )
    }
}

window.ValidateTool = ValidateTool;
export default Login;


/*
<div className='frow'>
        <p className="registerLink" onClick={this.openRegModal}>???? ????????????? ???????????? ??????????!</p>

            <form className="form" id="registrationForm" style={{ textAlign: 'center' }} onSubmit={this.register}>
                <p className="mt-3">???????? ???? ???????????? ??????????</p>
                <div className="form-group">
                    <label for="registerPrivateName">???????? ???? ????????</label>
                    <input onChange={this.handleInputChange} name='realm' id="registerPrivateName" className="form-control" type='text' required placeholder="???????? ???? ??????"></input>
                    <div className="validationError">{this.state.realm.text}</div>
                </div>
                <div className="form-group">
                    <label for="registerEmail">???????? ?????????? ????????</label>
                    <input onChange={this.handleInputChange} name='email' id="registerEmail" className="form-control" type='email' required placeholder={"example@gmail.com"}></input>
                    <div className="validationError">{this.state.email.text}</div>
                </div>
                <div className="form-group">
                    <label for="registerUserName">???????? ???? ??????????</label>
                    <input onChange={this.handleInputChange} name='username' id="registerUserName" className="form-control" type='text' required placeholder="???????? ???? ??????????"></input>
                    <div className="validationError">{this.state.username.text}</div>
                </div>
                <div className="form-group">
                    <label for="registerPasswd">???????? ??????????</label>
                    <input required name='password' id="registerPasswd" className="form-control" type='password' required placeholder="???????? ??????????" onChange={this.handleInputChange}></input>
                    <div className="validationError">{this.state.password.text}</div>
                </div>
                <button className='btn btn-warning' type='submit'>??????????!</button>
            </form>

    </div>
*/