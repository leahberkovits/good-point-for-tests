import React, { Component, Suspense } from 'react';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { inject, observer } from 'mobx-react'
import loadable from '@loadable/component';

import Auth from "./modules/auth/Auth";
import { PrivateRoute, PublicPrivateRoute } from './modules/auth/PrivateRoute';
import { HomeRoute } from './modules/auth/PrivateRoute';

import { createBrowserHistory } from 'history';


import './App.scss';
import './components/CSS/between-pages-animation.scss'
import { translate } from './translation/GPi18n';
import { setCookie } from './scenes/hello_page';

//scenes
const LoginPage = loadable(() => import('./scenes/login_page'))
const HelloPage = loadable(() => import('./scenes/hello_page'));
const HomePage = loadable(() => import('./scenes/home_page'))
const SendAGoodPointPage = loadable(() => import('./scenes/send_a_good_point_page'));
const ChatPage = loadable(() => import('./scenes/chat_page'))
const OpeningSentencePage = loadable(() => import('./scenes/opening_sentence_page'))
const SentPage = loadable(() => import('./scenes/sent_page'))
const MonthlySummaryPage = loadable(() => import('./scenes/monthly_summary_page'))
const SMSPage = loadable(() => import('./scenes/sms_page'))
const UrlNotFound = loadable(() => import('./scenes/url_not_found'))
const Admin = loadable(() => import('./scenes/admin'))
const SuperAdmin = loadable(() => import('./scenes/superadmin'))
const MoreOptionsPage = loadable(() => import('./scenes/more_options_page'))
const ExplanationPage = loadable(() => import('./scenes/explanation_page'))
const ChangePasswordPage = loadable(() => import('./scenes/change_password_page'));
const ResetPassword = loadable(() => import('./modules/auth/client/components/ResetPassword'));
const RotateToPorarit = loadable(() => import('./scenes/rotate_to_portrait'))
const AboutPage = loadable(() => import('./scenes/about_page'));
const Accessibility = loadable(() => import('./scenes/accessibility'));

const ProblemReportPage = loadable(() => import('./scenes/problem_report_page'));

class App extends Component {

    constructor(props) {
        super(props);
        this.state = { isAuth: false, alertVis: false, portr: true, teacherWebView: false };
        this.alertRef = React.createRef();
        this.alertTO = null;
        this.history = createBrowserHistory();

        // this.history.listen((location) => {
        //     window.ga('set', 'page', location.pathname + location.search);
        //     window.ga('send', 'pageview');
        // });
    }

    setView = () => {
        if (Auth.getKls().kl === "miremerijfgivn238svnsdfsdf" && !this.props.onMobile) {
            document.documentElement.style.setProperty('--vw', `${(window.innerWidth / 100) * 0.3}px`);
            document.documentElement.style.setProperty('--teacherView', 1); //need this in navbar.js for margin of navbar
            this.setState({ teacherWebView: true })
        }
        else document.documentElement.style.setProperty('--teacherView', 0);
    }

    async componentDidMount() {
        this.isAuth = await Auth.isAuthenticated();
        this.setState({ isAuth: this.isAuth });

        if (this.isAuth) {
            Auth.inactivityTime()
        }
        this.setView();

        window.addEventListener('offline', this.handleInternetOffline);
        window.addEventListener('orientationchange', (event) => {
            !localStorage.getItem('cancelRotate') && this.setState({ portr: window.orientation && (window.orientation != 0 && window.orientation != 180) ? false : true });
        });
        window.orientation && window.orientation != 0 && window.orientation != 180 && this.setState({ portr: false });

        let register;
        if ("serviceWorker" in navigator)
            register = await navigator.serviceWorker.register("/worker.js", { scope: "/" });
        if (localStorage.getItem('lang'));
        setCookie('lang', localStorage.getItem('lang'), 10000);
        if ((window.location.hash === "#/" || window.location.hash === "/") && localStorage.getItem("lang") && !Auth.isAuthenticated())
            window.location.hash += 'login';

    }
    componentWillUnmount() {
        window.removeEventListener('online', this.handleInternetOnline);
        window.removeEventListener('offline', this.handleInternetOffline);
    }

    handleInternetOffline = () => {
        this.showAlert(this.props.t("offline"))
        window.addEventListener('online', this.handleInternetOnline);
    }

    handleInternetOnline = () => {
        this.showAlert(this.props.t("online"));
        window.location.reload(); //maybe only if there is info that got NO_INTERNET err
    }

    showAlert(text) {
        if (this.state.alertVis) {
            this.alertTO && clearTimeout(this.alertTO)
            this.setState({ alertVis: false });
        }
        this.setState({ alertVis: true }, () => {
            if (this.alertRef && this.alertRef.current) this.alertRef.current.innerHTML = text
        });
        this.alertTO = setTimeout(() => { this.setState({ alertVis: false }); }, 5000);
    }


    render() {
        const LoginWithProps = (props) => < LoginPage postLogin={this.setView} {...props} />;
        const homePages = { HomePage, AdminHomePage: HomePage, SuperAdmin };
        const { onMobile } = this.props
        if (!onMobile) {
            homePages.AdminHomePage = Admin
            // homePages.HomePage = GoToPhone;
        }
        // document.getElementById("app").style.padding = "50px 10px 20px 30px";

        return <Suspense fallback={<div>Loading...</div>}>
            <Router >
                <div className={"App" + (this.state.teacherWebView ? " teacherWebView" : "")} id="app" >
                    {this.state.alertVis && <div id="noInternet" ref={this.alertRef} className="alertMsg" ></div>}
                    <Switch>
                        {!this.state.portr && <Route path="*" component={RotateToPorarit} />}
                        <HomeRoute exact path="/" component={HelloPage} comps={homePages} onMobile={onMobile} />
                        <PrivateRoute defaultRedirectComp={LoginWithProps} path="/superadmin-edit" compName='SuperAdmin' component={SuperAdmin} />

                        <Route path="/p" component={(props) => <SMSPage {...props} />} />

                        {<PrivateRoute exact path="/send-a-good-point" compName='SendAGoodPointPage' component={(props) => <SendAGoodPointPage {...props} />} defaultRedirectComp={LoginWithProps} />}
                        {<PrivateRoute exact path="/write-a-good-point" compName='ChatPage' component={ChatPage} defaultRedirectComp={LoginWithProps} />}
                        {<PrivateRoute exact path="/sent-point" compName='SentPage' component={SentPage} defaultRedirectComp={LoginWithProps} />}

                        {<PrivateRoute exact path="/opening-sentences" compName='OpeningSentencePage' component={OpeningSentencePage} defaultRedirectComp={LoginWithProps} />}

                        {<PrivateRoute exact path="/monthly-summary" compName='MonthlySummaryPage' component={MonthlySummaryPage} defaultRedirectComp={LoginWithProps} />}
                        {/* commented out - לפי הנחיות העיצוב */}
                        {/* { <PrivateRoute exact path="/class-monthly-summary" compName='ClassMonthlySummaryPage' component={ClassMonthlySummaryPage} defaultRedirectComp={LoginWithProps} /> } */}

                        {<PrivateRoute exact path="/report-problem" compName='ProblemReportPage' component={ProblemReportPage} defaultRedirectComp={LoginWithProps} />}
                        {<PrivateRoute exact path="/more-options" compName='MoreOptionsPage' component={MoreOptionsPage} defaultRedirectComp={LoginWithProps} />}
                        {<PrivateRoute exact path="/explanations" compName='ExplanationPage' component={ExplanationPage} defaultRedirectComp={LoginWithProps} />}

                        <Route exact path="/about" component={(props) => <AboutPage {...props} />} />

                        <Route path="/reset-password" component={(props) => <ResetPassword {...props} />} />
                        <PrivateRoute path="/change-password" compName='ChangePasswordPage' component={ChangePasswordPage} defaultRedirectComp={LoginWithProps} />

                        <PublicPrivateRoute exact path="/login" component={LoginWithProps} />
                        <PublicPrivateRoute exact path="/accessibility" component={Accessibility} />
                        <Route path="*" component={(props) => <UrlNotFound {...props} />} />

                    </Switch>
                </div>
            </Router>
        </Suspense>
    }
}

export default translate(inject("UsersStore")(observer(App)));