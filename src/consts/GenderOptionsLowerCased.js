import { getT } from "../translation/GPi18n";

const t = getT();

const GenderOptionsLowerCased = {
    MALE: "male",
    FEMALE: "female",
    NONE: "none"
}

export const convertStudentGenderToHeb = {
    'other': t("genders.other"),
    "female": t("genders.female"),
    "male": t("genders.male"),
    'OTHER': t("genders.other"),
    "FEMALE": t("genders.female"),
    "MALE": t("genders.male")
}
export const convertStudentGenderToEng = { // teacher (CustomUser) has the same gender options
    [t("genders.other")]: 'other',
    [t("genders.female")]: "female",
    [t("genders.male")]: "male"
}

export default GenderOptionsLowerCased;

//TODO use these in more places
//~ i tottaly forgot about these