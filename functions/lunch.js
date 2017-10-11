const moment = require('moment');
const _ = require('lodash');

const getWhatForLunch = lunches => {
  let content = null;
  _.each(lunches, lunch => {
    if (moment(lunch.date).isSame(moment(), 'day')) {
      content = lunch.content;
      return false;
    }
  });
  return content;
};

module.exports = {
  getWhatForLunch
};
