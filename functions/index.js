const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {ApiAiApp} = require('actions-on-google');
const https = require('https');

admin.initializeApp(functions.config().firebase);

const ACTION = {
  SLOT_NEXT: 'slot.next',
  TRAFFIC_BY_LINE: 'traffic.line',
};

const ARG = {
  METRO_LINE: 'metro_line',
};

const tellNextSlot = app => {
  app.ask('<speak>Le prochain slot est<break time="200ms"/>Dans ton Chat à 10h30</speak>');
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

const actionMap = new Map();
actionMap.set(ACTION.SLOT_NEXT, tellNextSlot);
actionMap.set(ACTION.TRAFFIC_BY_LINE, tellTrafficByLine);

exports.infoByXebia = functions.https.onRequest((request, response) => new ApiAiApp({
  request,
  response,
}).handleRequest(actionMap));
