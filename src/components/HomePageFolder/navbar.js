import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AppBar from '@material-ui/core/AppBar';
import '../CSS/navbar.scss'
import Auth from '../../modules/auth/Auth'
import { withRouter } from 'react-router-dom';
import HomePage from '../../scenes/home_page'
import { useTranslate } from '../../translation/GPi18n';



const useStyles = makeStyles(() => ({
  root: {
    margin: "0 35%"
  }
}))



function SwipeableTemporaryDrawer(props) {
  let classes = useStyles();
  const { t } = useTranslate();
  document.documentElement.style.getPropertyValue("--teacherView") == 0 && (classes = {})
  const [right, setRight] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState("/");
  const [itemTouch, setItemTouch] = React.useState(Array(4).fill(false));


  useEffect(() => {
    if (currentIndex !== props.history.location.pathname)
      setCurrentIndex(props.history.location.pathname)
  }, [])



  const toggleDrawer = (open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setRight(open);
  }


  const getNavItems = () => {
    const handleTouchStart = (i) => {
      let itemTouchTemp = [...itemTouch];
      itemTouchTemp[i] = true;
      setItemTouch(itemTouchTemp);
      setTimeout(() => {
        itemTouchTemp = [...itemTouch];
        itemTouchTemp[i] = false;
        setItemTouch(itemTouchTemp)
      }, 160);

    }
    const handleItemClick = (linkItem) => {
      linkItem.link && setCurrentIndex(linkItem.link);
      linkItem.onClick && linkItem.onClick();
      props.history.push(linkItem.link)
    }

    let pinkClass = "";
    const sideBarItems = [{ text: t("greetings.my_activity"), link: "/" }, { text: t("gp_summary"), link: "/monthly-summary" }, { text: t("opennings"), link: "/opening-sentences", }, { text: t("explaintions.title"), link: "/explanations", }, { text: t("more_options.title"), link: "/more-options", }, { text: t("logout"), onClick: () => { Auth.logout() } }]
    return sideBarItems.map((linkItem, index, arr) => {
      pinkClass = (linkItem.link === currentIndex) ? "onPagePink" : "";
      return (
        <div key={linkItem.link || "liI" + index} className={itemTouch[index] ? "nav-item-touch" : ""}
          onTouchStart={() => { handleTouchStart(index) }}
        >
          <ListItem onClick={(e) => { handleItemClick(linkItem) }}
            style={{ height: 93 / arr.length + "vh" }}
            className={`sidebar-link ${pinkClass} d-flex justify-content-center align-items-center`}
            id={index}
          >

            <ListItemText primary={linkItem.text} />
          </ListItem>
          {(index < arr.length) && <Divider />}
        </div>
      );
    })
  }


  const getSideBarList = () => (
    <List id="sidenav" className="pointer" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <div>
        {getNavItems()}
      </div>
    </List>
  );

  const redirectToHome = () => {
    const { history } = props;
    if (!history) return;

    history.location.pathname === "/" ?
      toggleDrawer(false)({ type: "swipe" })
      : (history.push('/') && setCurrentIndex("/"))
  }
  return (
    <div id="navbar-container">
      <AppBar style={{ boxShadow: "0px 0px 7px 0px #8c8c8c", backgroundColor: "white" }}>
        <div className="d-flex align-items-center justify-content-between">
          <Button onClick={toggleDrawer(!right)}>
            <img src="/images/navbarImg.png" alt="navigation bar" id="navbar-btn-hamburger" />
          </Button>
          <Button onClick={redirectToHome} >
            <img src="/images/logo.jpg" className="" alt="logo" id="navbar-btn-heart" />
          </Button>
        </div>
      </AppBar>
      <SwipeableDrawer
        anchor="right"
        classes={classes}
        open={right}
        onClose={() => toggleDrawer(false)({ type: "swipe" })}
        onOpen={() => toggleDrawer(true)({ type: "swipe" })}
        BackdropProps={{}}
        hideBackdrop
        disableBackdropTransition
        hysteresis={0.1} //Affects how far the drawer must be opened/closed to change his state. Specified as percent (0-1) of the width of the drawer
        minFlingVelocity={100}
        transitionDuration={{ enter: 300, exit: 300 }}
      >
        {getSideBarList()}
      </SwipeableDrawer>
    </div>
  );
}
export default withRouter(SwipeableTemporaryDrawer);
