import React from 'react';

import Top from '../components/top'
import SwipeableTemporaryDrawer from '../components/HomePageFolder/navbar'
import ExplanationList from '../components/explanations_list'

import '../components/CSS/explanation_page.scss'
import { useTranslate } from '../translation/GPi18n';


const MoreOptionsPage = (props) => {
    const { t } = useTranslate();
    const [popups, setPopups] = React.useState([])
    const [openImage, setOpenImage] = React.useState(false)
    const [imageAni, setImageAni] = React.useState(false)

    const changeUrl = (url) => {
        props.history.push(url)
    }

    const handleImageState = (newState) => {
        if (!newState) {
            setImageAni(false)
            setTimeout(() => { setOpenImage(false) }, 700)
        }
        else if (newState && !openImage) {
            setImageAni(true)
            setOpenImage(true)
        }
    }


    return (
        <div>
            <SwipeableTemporaryDrawer />
            <Top text={t("explaintions.title")} back={false} home={false} applyNavbarPageStyle={true} />
            <ExplanationList openPopups={setPopups} changeUrl={changeUrl} handleImageState={handleImageState} />
            {popups && popups.length ? popups.map(p => p) : null}
            {openImage ? <img draggable={false} className={imageAni ? "image-in-animation" : "image-out-animation"} onClick={() => { handleImageState(false) }} id="smspageimg" alt={t("parents_land_pg")} src="/images/smspage3google.jpeg" /> : null}

        </div>
    );
}

export default MoreOptionsPage;
