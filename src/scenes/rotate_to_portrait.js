import React from 'react';
import { useTranslate } from "../translation/GPi18n";
import '../components/CSS/rotate_to_portrait.scss';


const RotateToPortrait = () => {
    const {t} = useTranslate();

    return ( 
        <div id="rotateToPortait-container">
            <img id="roteteGif" src="/images/rotate-to-portrait.gif" alt={t("rotate")} />
        </div>
     );
}
 
export default RotateToPortrait;