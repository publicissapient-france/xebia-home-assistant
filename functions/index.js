const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {ApiAiApp} = require('actions-on-google');
const https = require('https');
const moment = require('moment');
const {getWhatForLunch} = require('./lunch');
const {getConference, getNextSlot} = require('./agenda');

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
};

const ARG = {
  METRO_LINE: 'metro_line',
};

const tellNextSlot = app => {
  database.ref().child('conference').once('value').then(res => {
    const slot = getNextSlot(res.val());
    if (slot) {
      // noinspection JSUnresolvedVariable
      app.ask(`<speak>Le prochain sujet est <break time="200ms"/>${slot.title} à ${moment(slot.date).format('HH[h]mm')}</speak>`);
    } else {
      app.tell('Désolé, il n\'y a plus de sujet pour aujourd\'hui, à bientôt');
    }
  });
};

const tellClosestStation = app => {
  app.ask(`La station Miromesnil est à 5 minutes`);
  // noinspection JSIgnoredPromiseFromCall
  cast('https://i.imgur.com/OEHXFO3.png', 'image/png');
};

const tellTrafficByLine = app => {
  // noinspection JSUnresolvedVariable
  const metroLine = app.getArgument(ARG.METRO_LINE);
  https.get(`https://api-ratp.pierre-grimaud.fr/v3/traffic/metros/${metroLine}`, res => {
    res.setEncoding('utf8');
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const data = JSON.parse(raw);
        // noinspection JSUnresolvedVariable
        if (data.result.slug === 'normal') {
          app.ask(`Le traffic est normal sur la ligne ${metroLine}`);
        } else {
          app.ask(data.result.message);
        }
      } catch (e) {
        console.error(e);
      }
    })
  });
};

const tellWhatForLunch = app => {
  database.ref().child('lunch').once('value').then(res => {
    const forLunch = getWhatForLunch(res.val()); // Get menu by day from firebase Db
    if (forLunch) {
      app.ask(forLunch);
    } else {
      app.ask('Et voilà le menu');
    }
    // noinspection JSIgnoredPromiseFromCall
    cast('https://i.imgur.com/txDXnub.png', 'image/png'); // 'cause it's same image every day
  });
};

const tellHowToContactXebia = app => {
  app.ask('Passez nous voir au 3ème étage ou appelez-nous');
  cast('https://i.imgur.com/hLtorIG.png', 'image/png');
};

const tellLocalMap = app => {
  app.ask('Voici le plan');
  cast('https://i.imgur.com/jenxLHI.png', 'image/png');
};

const cast = (url, type) => database.ref().child('content').update({url, type});

const tellAgenda = app => {
  database.ref().child('conference').once('value').then(res => {
    const conf = getConference(res.val());
    // noinspection JSUnresolvedVariable
    if (conf && conf.agenda) {
      app.ask('Voilà le planning de la journée');
      // noinspection JSUnresolvedVariable
      cast(conf.agenda, 'image/png');
    } else {
      app.ask('Désolé, je n\'ai pas trouvé le planning d\'aujourd\'hui')
    }
  });
};

const actionMap = new Map();
actionMap.set(ACTION.SLOT_NEXT, tellNextSlot);
actionMap.set(ACTION.TRAFFIC_BY_LINE, tellTrafficByLine);
actionMap.set(ACTION.CLOSEST_STATION, tellClosestStation);
actionMap.set(ACTION.LUNCH, tellWhatForLunch);
actionMap.set(ACTION.CONTACT_XEBIA, tellHowToContactXebia);
actionMap.set(ACTION.MAP_LOCAL, tellLocalMap);
actionMap.set(ACTION.AGENDA, tellAgenda);

exports.infoByXebia = functions.https.onRequest((request, response) => new ApiAiApp({
  request,
  response,
}).handleRequest(actionMap));
