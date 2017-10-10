const firebase = require('./firebase').getFirebaseClient();
const DisplayService = require('./cast');

const service = new DisplayService();

const eventRef = firebase.database().ref('xebia-home/displayContent');

eventRef.on('value', snapshot => {
  service.connect()
    .then(() => service.playContent(snapshot.child('url').val(), snapshot.child('type').val()))
  service.disconnect()
});
