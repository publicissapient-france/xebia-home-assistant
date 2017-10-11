const moment = require('moment');
const _ = require('lodash');

const getAgenda = (conferences) => {
  let agenda = null;
  _.each(conferences, conf => {
    if (moment(conf.date).isSame(moment(), 'day')) {
      agenda = conf.agenda;
      return false;
    }
  });
  return agenda;
};

module.exports = {
  getAgenda
};
