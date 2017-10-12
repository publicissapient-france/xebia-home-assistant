const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {ApiAiApp} = require('actions-on-google');
const https = require('https');
const {getWhatForLunch} = require('./lunch');
const {getAgenda} = require('./agenda');
const logger = require('./logger');

admin.initializeApp(functions.config().firebase);

const database = admin.database();

const ACTION = {
  SLOT_NEXT: 'slot.next',
  TRAFFIC_BY_LINE: 'traffic.line',
  CLOSEST_STATION: 'closest.station',
  LUNCH: 'lunch',
  CONTACT_XEBIA: 'contact.xebia',
  MAP_LOCAL: 'map.local',
  AGENDA: 'agenda',
  ASK_AGAIN: 'ask.again'

};

const ARG = {
  METRO_LINE: 'metro_line',
};

const tellNextSlot = app => {
  const message = 'Le prochain slot est<break time="200ms"/>Dans ton Chat à 10h30.'
  loop(app, message)
};

const loop = (app, previousMessage) => {
  logger.debug(`Looping`)
  app.setContext('yes_no');
  app.ask(`<speak>${previousMessage} <break time="2s"/> Avez vous besoin d'autre chose ?</speak>`);
};

const tellClosestStation = app => {
  // noinspection JSIgnoredPromiseFromCall
  cast('https://i.imgur.com/OEHXFO3.png', 'image/png');
  const message = `La station Miromesnil est à 5 minutes`;
  loop(app, message)
};

const tellTrafficByLine = app => {
  // noinspection JSUnresolvedVariable
  const metroLine = app.getArgument(ARG.METRO_LINE);
  var message;
  https.get(`https://api-ratp.pierre-grimaud.fr/v3/traffic/metros/${metroLine}`, res => {
    res.setEncoding('utf8');
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const data = JSON.parse(raw);
        // noinspection JSUnresolvedVariable
        if (data.result.slug === 'normal') {
          message = `Le traffic est normal sur la ligne ${metroLine}`;
        } else {
          message = data.result.message;
        }
      } catch (e) {
        console.error(e);
      }
    })
  });
  loop(app, message)
};

const tellWhatForLunch = app => {
  database.ref().child('lunch').once('value').then(res => {
    const forLunch = getWhatForLunch(res.val()); // Get menu by day from firebase Db
    var message;
    // noinspection JSIgnoredPromiseFromCall
    cast('https://i.imgur.com/txDXnub.png', 'image/png'); // 'cause it's same image every day
    if (forLunch) {
      message = forLunch;
    } else {
      message = 'Et voilà le menu';
    }
  });
  loop(app, message)
};

const tellHowToContactXebia = app => {
  cast('https://i.imgur.com/hLtorIG.png', 'image/png');
  const message = 'Passez nous voir au 3ème étage ou appelez-nous';
  loop(app, message)
};

const tellLocalMap = app => {
  cast('https://i.imgur.com/jenxLHI.png', 'image/png');
  const message = 'Voici le plan';
  loop(app, message)
};

const cast = (url, type) => {
  database.ref().child('content').update({url, type});
}

const tellAgenda = app => {
  database.ref().child('conference').once('value').then(res => {
    const agenda = getAgenda(res.val());
    if (agenda) {
      // noinspection JSUnresolvedVariable
      cast(agenda, 'image/png');
      const message = 'Voilà le planning de la journée';
    } else {
      const message = 'Désolé, je n\'ai pas trouvé le planning d\'aujourd\'hui'
    }
  });
  loop(app, message)
};

const askSomethingNew = app => {
  app.ask('Que puis-je faire pour vous ?')
};

const actionMap = new Map();
actionMap.set(ACTION.SLOT_NEXT, tellNextSlot);
actionMap.set(ACTION.TRAFFIC_BY_LINE, tellTrafficByLine);
actionMap.set(ACTION.CLOSEST_STATION, tellClosestStation);
actionMap.set(ACTION.LUNCH, tellWhatForLunch);
actionMap.set(ACTION.CONTACT_XEBIA, tellHowToContactXebia);
actionMap.set(ACTION.MAP_LOCAL, tellLocalMap);
actionMap.set(ACTION.AGENDA, tellAgenda);
actionMap.set(ACTION.ASK_AGAIN, askSomethingNew);


exports.infoByXebia = functions.https.onRequest((request, response) => new ApiAiApp({
  request,
  response,
}).handleRequest(actionMap));
