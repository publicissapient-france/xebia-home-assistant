const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {ApiAiApp} = require('actions-on-google');
const https = require('https');
const moment = require('moment');
const {getWhatForLunch} = require('./lunch');
const logger = require('./logger');
const {getConference, getNextSlot, getNextBreak} = require('./agenda');

const homeImage = 'https://i.imgur.com/wTOdCg3.png';

admin.initializeApp(functions.config().firebase);

const database = admin.database();

const ACTION = {
  SLOT_NEXT: 'slot.next',
  BREAK_NEXT: 'break.next',
  TRAFFIC_BY_LINE: 'traffic.line',
  CLOSEST_STATION: 'closest.station',
  LUNCH: 'lunch',
  CONTACT_XEBIA: 'contact.xebia',
  MAP_LOCAL: 'map.local',
  AGENDA: 'agenda',
  ASK_AGAIN: 'ask.again',
  END_CONVERSATION: 'end.conversation'

};

const ARG = {
  METRO_LINE: 'metro_line',
};

const loop = (app, previousMessage) => {
  logger.debug(`Looping`)
  app.setContext('yes_no');
  app.ask(`<speak>${previousMessage} <break time="2s"/> Avez vous besoin d'autre chose ?</speak>`);
}

var timeoutForHomeScreen;

const setTimeoutToDisplayHomeScreen = () => {
  timeoutForHomeScreen = setTimeout(() => cast(homeImage, 'image/png'), 5000);
};

function clearTimeoutToDisplayHomeScreen() {
  clearTimeout(timeoutForHomeScreen);
}

const tellNextSlot = app => {
  database.ref().child('conference').once('value').then(res => {
    const slot = getNextSlot(res.val());
    if (slot) {
      // noinspection JSUnresolvedVariable
      app.ask(`<speak>Le prochain sujet est <break time="200ms"/>${slot.title} à ${moment(slot.date).utcOffset('+0200').format('HH[h]mm')}</speak>`);
    } else {
      app.tell('Désolé, il n\'y a plus de sujet pour aujourd\'hui, à bientôt');
    }
  });
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
  https.get(`https://api-ratp.pierre-grimaud.fr/v3/traffic/metros/${metroLine}`, res => {
    res.setEncoding('utf8');
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        let message
        const data = JSON.parse(raw);
        // noinspection JSUnresolvedVariable
        if (data.result.slug === 'normal') {
          message = `Le traffic est normal sur la ligne ${metroLine}`;
        } else {
          message = data.result.message;
        }
        loop(app, message)
      } catch (e) {
        console.error(e);
      }

    })
  })
};

const tellWhatForLunch = app => {
  database.ref().child('lunch').once('value').then(res => {
    const forLunch = getWhatForLunch(res.val()); // Get menu by day from firebase Db
    // noinspection JSIgnoredPromiseFromCall
    cast('https://i.imgur.com/txDXnub.png', 'image/png'); // 'cause it's same image every day
    if (forLunch) {
      return forLunch;
    } else {
      return 'Et voilà le menu';
    }
  }).then((message) => {
    loop(app, message)
  })

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
      let message
      const conf = getConference(res.val());
      // noinspection JSUnresolvedVariable
      if (conf && conf.agenda) {
        message = 'Voilà le planning de la journée';
        // noinspection JSUnresolvedVariable
        cast(conf.agenda, 'image/png');
      } else {
        message = 'Désolé, je n\'ai pas trouvé le planning d\'aujourd\'hui'
      }
      loop(app, message)
    }
  );
};

const askSomethingNew = app => {
  app.ask('Que puis-je faire pour vous ?')
};

const tellNextBreak = app => {
  database.ref().child('conference').once('value').then(res => {
    const time = getNextBreak(res.val());
    if (time) {
      app.ask(`<speak>La prochaine pause est à <break time="200ms"/>${time}</speak>`);
    } else {
      app.ask('<speak>Désolé, mais il n\'y a plus de pause prévue pour aujourd\'ui <break time="200ms"/> courage</speak>');
    }
  });
};

const endConversation = app => {
  cast(homeImage, 'image/png');
  if (app.getIncomingRichResponse()) {
    app.tell(app.getIncomingRichResponse())
  }
  else {
    app.tell('Bonne journée');
  }
};

const actionMap = new Map();
actionMap.set(ACTION.SLOT_NEXT, tellNextSlot);
actionMap.set(ACTION.BREAK_NEXT, tellNextBreak);
actionMap.set(ACTION.TRAFFIC_BY_LINE, tellTrafficByLine);
actionMap.set(ACTION.CLOSEST_STATION, tellClosestStation);
actionMap.set(ACTION.LUNCH, tellWhatForLunch);
actionMap.set(ACTION.CONTACT_XEBIA, tellHowToContactXebia);
actionMap.set(ACTION.MAP_LOCAL, tellLocalMap);
actionMap.set(ACTION.AGENDA, tellAgenda);
actionMap.set(ACTION.ASK_AGAIN, askSomethingNew);
actionMap.set(ACTION.END_CONVERSATION, endConversation);

cast(homeImage, 'image/png');

exports.infoByXebia = functions.https.onRequest((request, response) => new ApiAiApp({
  request,
  response,
}).handleRequest(actionMap));
