import { observable, decorate, action, computed, runInAction } from 'mobx';
import ClassesUtils from '../components/ClassesUtils'
import Auth from '../modules/auth/Auth';

class ClassesStore { // is never being used

}
decorate(ClassesStore, {});
let classesstore = window.classesstore = new ClassesStore();
export default classesstore;

