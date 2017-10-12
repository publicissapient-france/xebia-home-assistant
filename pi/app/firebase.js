const firebase = require('firebase');

const config = JSON.parse(process.env.FIREBASE_CONFIG);

firebase.initializeApp(config);

module.exports.getFirebaseClient = () => firebase;
