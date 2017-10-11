const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {ApiAiApp} = require('actions-on-google');
const https = require('https');
const {getWhatForLunch} = require('./lunch');

admin.initializeApp(functions.config().firebase);

const database = admin.database();

const ACTION = {
  SLOT_NEXT: 'slot.next',
  TRAFFIC_BY_LINE: 'traffic.line',
  CLOSEST_STATION: 'closest.station',
  LUNCH: 'lunch',
};

const ARG = {
  METRO_LINE: 'metro_line',
};

const tellNextSlot = app => {
  app.ask('<speak>Le prochain slot est<break time="200ms"/>Dans ton Chat à 10h30</speak>');
};

const fireClosestStationEvent = app => {
  database.ref().child('content').update({
    "url": "http://lasaintepaire.com/wp-content/uploads/2016/02/Fresque-Murale-Xebia-1920x587.png",
    "type": "image/png"
  })
};

const tellTrafficByLine = app => {
  // noinspection JSUnresolvedVariable
  https.get(`https://api-ratp.pierre-grimaud.fr/v3/traffic/metros/${app.getArgument(ARG.METRO_LINE)}`, res => {
    res.setEncoding('utf8');
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const data = JSON.parse(raw);
        // noinspection JSUnresolvedVariable
        if (data.result.slug === 'normal') {
          app.ask(`Le traffic est normal sur la ligne ${app.getArgument(ARG.METRO_LINE)}`);
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
    const forLunch = getWhatForLunch(res.val());
    if (forLunch) {
      app.ask(forLunch);
    } else {
      app.ask('Désolé, je \'ai pas trouvé de menu pour aujourd\'hui');
    }
  });
};

const actionMap = new Map();
actionMap.set(ACTION.SLOT_NEXT, tellNextSlot);
actionMap.set(ACTION.TRAFFIC_BY_LINE, tellTrafficByLine);
actionMap.set(ACTION.CLOSEST_STATION, fireClosestStationEvent);
actionMap.set(ACTION.LUNCH, tellWhatForLunch);

exports.infoByXebia = functions.https.onRequest((request, response) => new ApiAiApp({
  request,
  response,
}).handleRequest(actionMap));
