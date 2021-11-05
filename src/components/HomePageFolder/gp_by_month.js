import React from 'react';
import { observer, inject } from "mobx-react"
import InfiniteScroll from 'react-infinite-scroll-component'

import GPDetails from './gp_details'
import GPLoading from './gp_loading'
import '../CSS/gp_by_month.scss'
import consts from '../../consts/consts';
import { translate, getLanguage } from '../../translation/GPi18n';


class GpByMonth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scrollDown: false,
            endMsgAppear: this.props.endMsgClass,
            clickedGPs: []
        };
        this.lastGPRef = React.createRef();
        this.lastScrollTop = 0;
        this.lastGpListLength = 0;
        this.lang = getLanguage();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.month !== this.props.month) {
            this.props.GoodPointsStore.selectedMonth = this.props.month + 1;
        }
    }
    componentDidMount() {
        window.onbeforeunload = () => { window.scrollTo(0, 0); }
    }

    dateFormatChange = (date) => {
        // changes date to the format: dd/mm/yy
        date = date.substring(0, 10);
        let array = date.split(/\-/g);
        [array[0], array[array.length - 1]] = [array[array.length - 1], array[0]];
        array[2] = array[2].substr(2, 2)
        return array.join('.')
    }

    fetchMoreData = () => {
        // 'fetchMoreData')
        this.props.GoodPointsStore.fetchMorePointsForSelectedMonth();
    }

    handleGPClick = (index) => {
        let clickedGPs = this.state.clickedGPs.includes(index) //adds the class index to the array and removes the class index if it is already there 
            ? this.state.clickedGPs.filter(v => v !== index)
            : [...this.state.clickedGPs, index];
        this.setState({ clickedGPs: clickedGPs });
    }


    render() {
        // need to apply error messages for the right circumstances
        let monthGPs = this.props.GoodPointsStore.selectedMonthGoodPoints;
        if (monthGPs === null) return <div>{Array(10).fill(1).map((n, i) => {
            return <GPLoading key={"k1" + i} keyVal={"k" + i} />
        })}</div>

        if (typeof monthGPs === "string") {
            return <div>{monthGPs}</div>
        }
        console.log('this.props.consts:', this.props.consts.HEBREW_MONTHS)
        if (!monthGPs.length) {
            monthGPs = <p id="noPointsMsg" >{`${this.props.t("not_sent_on")} ${this.props.consts.HEBREW_MONTHS[this.props.GoodPointsStore.selectedMonth - 1]}`}</p>
            this.props.GoodPointsStore.noMore();
            return <div>{monthGPs}</div>;
        }
        else {
            monthGPs = monthGPs.map((goodPoint, index, arr) => {
                let date = this.dateFormatChange(goodPoint.gpCreated);
                let text = (goodPoint.gpText.length > consts.TEXT_BOX_CHAR_LIMIT && Array.isArray(this.state.clickedGPs) && !this.state.clickedGPs.find(gp => gp == goodPoint.id)) /* limit */ ? (goodPoint.gpText.substr(0, consts.TEXT_BOX_CHAR_LIMIT) + " ...") : goodPoint.gpText;
                return <GPDetails key={goodPoint.id} id={goodPoint.id} handleGPClick={this.handleGPClick} classs={this.state.clickedGPs.includes(goodPoint.id) ? 'gpClicked' : ''} gender={goodPoint.studentGender} first={goodPoint.studentFirstName} last={goodPoint.studentLastName} date={date} text={text} studentId={goodPoint.studentId} classIndex={goodPoint.classIndex} grade={goodPoint.grade} />
            })
        }

        let gplistLength = monthGPs ? monthGPs.length : 5;
        let d = this.props.GoodPointsStore.hasMoreMyActivity();
        return (
            <InfiniteScroll
                dataLength={gplistLength}
                next={() => { this.props.GoodPointsStore.fetchMorePointsForSelectedMonth(); }}
                hasMore={d}
                scrollThreshold={1}
                loader={<img src="/images/loading2.gif" height={"50vh"} />}
                scrollableTarget={"home-page-container"}
                onScroll={this.props.handleGPsScroll}
            >
                {monthGPs}
            </InfiniteScroll >
        );

    }
}
export default translate(inject("GoodPointsStore")(observer(GpByMonth)));  