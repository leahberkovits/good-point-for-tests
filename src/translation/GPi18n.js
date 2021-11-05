import i18next from 'i18next';
import { withTranslation, useTranslation } from 'react-i18next';
import clientLanguages from './languages.json';
//translations
import heTranslation from './he.json';
import arTranslation from './ar.json';

export function getLanguage() {

    let lang = localStorage.getItem('lang');
    if (!lang || !Object.keys(clientLanguages).includes(lang)) lang = 'he';
    return lang;
}

const lang = getLanguage();
i18next.init({
    interpolation: { escapeValue: false },  // React already does escaping????
    lng: lang,
    resources: {
        he: {
            common: heTranslation
        },
        ar: {
            common: arTranslation
        },
    },
});

export default i18next;

export const translate = withTranslation("common");
export const useTranslate = () => useTranslation("common"); //use in hooks
export const getT = () => i18next.getFixedT(i18next.language, "common"); //use outside of a component