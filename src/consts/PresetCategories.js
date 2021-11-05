import { getT } from "../translation/GPi18n";

const t = getT();
const PresetCategories = {
    SOCIAL: "social",
    EMOTIONAL: "emotional",
    EDUCATIONAL: "educational",
    OTHER: "other"
}

export const convertCateg = {
    [t("opennings_msg.categories.educational")]: "educational",
    [t("opennings_msg.categories.social")]: "social",
    [t("opennings_msg.categories.emotional")]: "emotional",
    [t("opennings_msg.categories.other")]: "other"
}
export const convertPresetGender = {
    [t("genders.other")]: 'none',
    [t("genders.female")]: "female",
    [t("genders.male")]: "male"
}


export default PresetCategories;

