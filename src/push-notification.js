import firebase from "firebase";
import "@firebase/messaging";

export const initializeFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyBUt6Q1EwLmAJcoDf-jkayykwVPIB4jAoc",
      authDomain: "push-notification-57945.firebaseapp.com",
      databaseURL: "https://push-notification-57945.firebaseio.com",
      projectId: "push-notification-57945",
      storageBucket: "push-notification-57945.appspot.com",
      messagingSenderId: "1002072445602",
      appId: "1:1002072445602:web:c408ae918740a533a8fdfb",
    });
  }
};

export const askForPermissionToReceiveNotifications = async () => {
  initializeFirebase();
  try {
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    const token = await messaging.getToken();
    alert(token);
    return token;
  } catch (error) {
    alert(error);
  }
};
