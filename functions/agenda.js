const moment = require('moment');
const _ = require('lodash');

const getConference = conferences => {
  let conf = null;
  _.each(conferences, c => {
    if (moment(c.date).isSame(moment(), 'day')) {
      conf = c;
      return false;
    }
  });
  return conf;
};

const sortByDate = items => _.sortBy(items, ['date']);

const getNextSlot = conferences => {
  let slot = null;
  const conf = getConference(conferences);
  if (conf) {
    const now = moment();
    const sortSlot = sortByDate(conf.slot);
    _.each(sortSlot, s => {
      if (moment(s.date).isAfter(now)) {
        slot = s;
        return false;
      }
    });
  }
  return slot;
};

const getNextBreak = conferences => {
  let time = null;
  const conf = getConference(conferences);
  if (conf) {
    const now = moment();
    const sortSlot = sortByDate(conf.slot);
    _.each(sortSlot, s => {
      let d = moment(s.date);
      if (d.isAfter(now) && s.type === 'break') {
        time = d.utcOffset('+0200').format('HH[h]mm');
        return false;
      }
    });
  }
  return time;
};

module.exports = {
  getConference,
  sortByDate,
  getNextSlot,
  getNextBreak,
};
