import React from 'react';
import { Link } from 'react-router-dom'
import './CSS/top.scss'
import { withRouter } from 'react-router-dom';
import consts from '../consts/consts';


function Top({ back: backTo, text, home, underText, applyNavbarPageStyle, backToState, history }) {
    // constructor(props) {
    // super(props);
    // this.applyNavbarPageStyle = this.props.;
    // }

    const goBack = () => {
        if (backTo === consts.JUST_GO_BACK) {
            history.goBack();
            return;
        }
        if (backToState) {
            history.pushState(backToState || null, null, backTo);
            return;
        }
        history.push(backTo);
    }

    // render() {
    // let backTo = this.props.back;
    return (
        <div id="top-container" className={applyNavbarPageStyle ? 'top-container-second' : 'top-container-default'} >
            <div id="main" className={`d-flex justify-content-between align-items-center ${applyNavbarPageStyle ? "main-second" : "main-default"}`} >

                {/* back button */}
                {backTo ? <img onClick={goBack} src="/images/backIcon.png" className="" id="back-btn" color="#CCCCCC" />
                    : <div id="back-btn"> </div>
                }

                {/* title text */}
                {text && <div id="title" className="" >{text} </div>}

                {/* home button */}
                {home ? <Link to="/">
                    <img src="/images/homeIcon.png" className="" id="home-btn" color="#CCCCCC" />
                </Link>
                    : <div id="home-btn"> </div>
                }
            </div>
            {underText && // added but should not b used anywhere
                <div id="underText">{underText}</div>
            }
            <hr id="top-hrGradient" className={`${applyNavbarPageStyle ? "hrGradient-second" : "hrGradient-default"}`} />
        </div>
    );
}
// }


export default withRouter(Top);
