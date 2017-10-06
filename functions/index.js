const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {ApiAiApp} = require('actions-on-google');
const http = require('http');

admin.initializeApp(functions.config().firebase);

const action = {
  SLOT_NEXT: 'slot.next',
  TRAFFIC_BY_LINE: 'traffic.line',
};

const argument = {
  METRO_LINE: 'metro_line',
};

const tellNextSlot = app => {
  app.tell('<speak>Le prochain slot est<break time="200ms"/>Dans ton Chat à 10h30</speak>');
};

const tellTrafficByLine = app => {
  // noinspection JSUnresolvedVariable
  http.get(`http://api-ratp.pierre-grimaud.fr/v3/traffic/metros/13`, res => {
    // noinspection JSUnresolvedVariable
    app.tell(res.result.message);
  });
};

const actionMap = new Map();
actionMap.set(action.SLOT_NEXT, tellNextSlot);
actionMap.set(action.TRAFFIC_BY_LINE, tellTrafficByLine);

exports.infoByXebia = functions.https.onRequest((request, response) => new ApiAiApp({
  request,
  response,
}).handleRequest(actionMap));
