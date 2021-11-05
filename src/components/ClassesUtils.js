import Auth from '../modules/auth/Auth';
import consts from '../consts/consts'
import { getLanguage, getT } from '../translation/GPi18n';
import { classNumbers } from '../contexts/constsContext';
const ClassesUtils = {
    classesList: [],
    error: null,
    isfetchedClasses: false,
    fetchCnt: 0,


    async fetchClasses() {
        const t = getT();
        if (this.isfetchedClasses) {
            return Promise.resolve(this.classesList);
        }
        else {
            this.isfetchedClasses = true;
            let [res, err] = await Auth.superAuthFetch("/api/Classes/fetchClasses", null, true, true);
            if (err) {
                this.fetchCnt ? this.fetchCnt++ : this.fetchCnt = 1;
                if (this.fetchCnt < 3) {
                    setTimeout(() => { this.fetchClasses() }, 1000);
                    return;
                }
                const error = err === "NO_INTERNET" ? t("no_internet_info") : t("try_again_later");
                this.classesList = error;
            }
            const uClassesList = []
            res.classesList.forEach(c => {
                if (uClassesList.find(uc => uc.grade == c.grade && uc.classIndex == c.classIndex))
                    return;
                uClassesList.push(c)
            });
            this.classesList = uClassesList
            return Promise.resolve(uClassesList);
        }
    },

    getGrades() {
        const lang = getLanguage();
        if (this.lang === lang) {
            return
        }
        const t = getT();
        this.lang = lang;
        let grades = {};
        classNumbers.forEach(item => grades[t("grades." + item)] = item);
        this.englishGradesObj = grades;
        this.hebrewGrades = Object.keys(grades)
    },

    async getHebrewGrades() {
        //returns grade alone, in hebrew
        this.getGrades();
        const grades = this.hebrewGrades;
        if (!this.isfetchedClasses) {
            await this.fetchClasses();
        }
        let gradesHebrew = this.classesList.map((classData) => {
            return grades[classData.grade - 1]
        })
        return [...new Set(gradesHebrew)];
    },


    convertToEnglishGrades(hebrewGrade) {
        //returns grade alone, in english
        return this.englishGradesObj[hebrewGrade]
    },

    collapseClassList(hebGrade, withId = false) {
        // returns grade letter in hebrew, and class number index 
        let classes = this.classesList.filter((classData) => {
            return classData.grade == this.convertToEnglishGrades(hebGrade)
        });
        classes.sort(((a, b) => (a.grade === b.grade) ? ((a.classIndex < b.classIndex) ? -1 : (a.classIndex > b.classIndex) ? 1 : 0) : (a.grade < Number(b.grade)) ? -1 : 1));
        this.getGrades();
        classes = classes.map(clsInfo => {
            const clas = this.hebrewGrades[clsInfo.grade - 1] + " " + clsInfo.classIndex;
            if (withId) return { classId: clsInfo.id, clas: clas }
            return clas;
        })
        return classes;
    }
} // end of object 
setTimeout(() => {
    ClassesUtils.getGrades();
}, 200);

export default ClassesUtils;

