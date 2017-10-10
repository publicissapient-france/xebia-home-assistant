const firebase = require('firebase');

const config = {
  apiKey: "AIzaSyDGaGfpI1SR-TpnHoysQDgJEgIJi_jGRz8",
  authDomain: "xebia-home.firebaseapp.com",
  databaseURL: "https://xebia-home.firebaseio.com",
  projectId: "xebia-home",
  storageBucket: "xebia-home.appspot.com",
  messagingSenderId: "786982934869"
};

firebase.initializeApp(config);

module.exports.getFirebaseClient = () => firebase;
