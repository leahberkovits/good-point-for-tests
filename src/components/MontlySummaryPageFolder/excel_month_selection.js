import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { observer, inject } from "mobx-react"
import { translate } from '../../translation/GPi18n';

import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

import '../CSS/excel_month_selection.scss'

class ExcelMonthSelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchors: Array(2).fill(null),
            excelButtonAni: false,
            excelButtonDisplay: false
        };
        this.monthToMonth = []
        this.dd1ref = React.createRef();
        this.dd2ref = React.createRef();
        this.monthNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        this.monthNames = [this.props.t("months.january"), this.props.t("months.february"), this.props.t("months.march"), this.props.t("months.april"), this.props.t("months.may"), this.props.t("months.june"), this.props.t("months.july"), this.props.t("months.august"), this.props.t("months.september"), this.props.t("months.october"), this.props.t("months.november"), this.props.t("months.december")]
        const d = new Date()
        const currMonth = d.getMonth(); // 0-11
        const currYear = d.getFullYear();
        this.monthNames = this.monthNums.map((monthNum) => {
            if (currMonth >= 8 && currMonth <= 11) {
                if (monthNum >= 8 && monthNum <= 11) {
                    return this.monthNames[monthNum] + " " + currYear;
                } else {
                    return this.monthNames[monthNum] + " " + (Number(currYear) + 1); // || ""
                }
            } else {
                if (monthNum >= 8 && monthNum <= 11) {
                    return this.monthNames[monthNum] + " " + (Number(currYear) - 1) // || ""
                }
                else {
                    return this.monthNames[monthNum] + " " + currYear;
                }
            }
        })
    }

    componentDidMount() {
        let d = new Date();
        let m = d.getMonth();
        this.monthToMonth = [m, (m + 1) % 12]
        this.props.GoodPointsStore.changeMonths([m, (m + 1) % 12])
    }


    handleDDClick = (event, i) => {
        let { anchors } = this.state
        anchors[i] = event.currentTarget
        this.setState({ anchors });
    }

    handleMonthSelection = (monthNum, i, index) => {
        this.monthToMonth[i] = monthNum;
        this.props.GoodPointsStore.changeMonths(this.monthToMonth)
        this.setState({ anchors: Array(2).fill(null) });
    }

    handleClose = (event, i) => {
        this.setState({ anchors: Array(2).fill(null) });
    };
    render() {
        const open1 = Boolean(this.state.anchors[0]);
        const open2 = Boolean(this.state.anchors[1]);
        const id1 = open1 ? 'simple-popover' : undefined;
        const id2 = open2 ? 'simple-popover' : undefined;

        let show = this.props.GoodPointsStore.displayExportButton || this.props.show;
        if (show && !this.state.excelButtonAni) {
            this.setState({ excelButtonDisplay: true, excelButtonAni: true });
        }
        if (!show && this.state.excelButtonAni) {
            this.setState({ excelButtonAni: false });
            setTimeout(() => {
                this.setState({ excelButtonDisplay: false });
            }, 500)
        }
        return (
            <div id="excelMonthSelection-container" style={{ display: this.state.excelButtonDisplay ? "flex" : "none" }} className={this.state.excelButtonAni ? "flip-in-hor-bottom-animation" : "flip-out-hor-top-animation "}>

                <div className="monthSelectionButton" ref={this.dd1ref} onClick={(e) => { this.handleDDClick(e, 0) }}  >
                    {this.monthNames[this.props.GoodPointsStore.monthToMonthForExcel[0]]}
                    <ArrowDropDownIcon id="arrow" />
                </div>

                <Popover id={id1} open={open1} anchorEl={this.state.anchors[0]} onClose={(e) => { this.handleClose(e, 0) }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <Typography > {/* dropdown to show under first month selection */}
                        <div id="month-dropdown-container" >
                            <List id="class-summary-list" component="nav" aria-labelledby="nested-list-subheader" className="root" style={{ maxHeight: '100%', overflow: 'auto' }}>
                                {this.monthNums.map((monthNum, index, arr) => {
                                    return (<div key={monthNum}>
                                        {index !== 0 && <Divider />}
                                        <ListItem button onClick={() => { this.handleMonthSelection(monthNum, 0, index) }}>
                                            <ListItemText primary={this.monthNames[monthNum]} />
                                        </ListItem>
                                    </div>
                                    )
                                })}
                            </List>
                        </div>
                    </Typography>
                </Popover>

                <div id="text-till">{this.props.t("until")}</div>

                <div ref={this.dd2ref} className="monthSelectionButton" onClick={(e) => { this.handleDDClick(e, 1) }} >
                    {this.monthNames[this.props.GoodPointsStore.monthToMonthForExcel[1]]}
                    <ArrowDropDownIcon id="arrow" />
                </div>

                <Popover id={id2} open={open2} anchorEl={this.state.anchors[1]} onClose={(e) => { this.handleClose(e, 1) }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >

                    <Typography > {/* dropdown to show under second month selection */}
                        <div id="month-dropdown-container" >
                            <List id="class-summary-list" component="nav" aria-labelledby="nested-list-subheader" className="root" >
                                {this.monthNums.map((monthNum, index, arr) => {
                                    return (<div key={monthNum}>
                                        {index !== 0 && <Divider />}
                                        <ListItem button onClick={() => { this.handleMonthSelection(monthNum, 1, index) }}>
                                            <ListItemText primary={this.monthNames[monthNum]} />
                                        </ListItem>
                                    </div>
                                    )
                                })}
                            </List>
                        </div>
                    </Typography>
                </Popover>

            </div>
        )
    }
}
export default translate(inject("GoodPointsStore")(observer(ExcelMonthSelection)));