const firebase = require('./firebase').getFirebaseClient();
const DisplayService = require('./cast');

const service = new DisplayService();

const eventRef = firebase.database().ref().child('content');

eventRef.on('child_changed', (snapshot, previous) => {
  console.log(snapshot)
  service.connect(process.argv[2])
    .then(() => {
      eventRef.once('value', content =>
        service.playContent(content.child('url').val(), content.child('type').val())
      )
    })
});

const disconnectService = () => {
  logger.debug(`Disconnecting Cast`)
  service.disconnect()
}

process.on('SIGTERM', disconnectService);
process.on('SIGINT', disconnectService);
