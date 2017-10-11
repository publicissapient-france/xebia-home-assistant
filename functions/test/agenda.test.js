// noinspection JSUnusedLocalSymbols
const should = require('chai').should();
const {getAgenda} = require('../agenda');
const moment = require('moment');

describe('Planning', () => {
  describe('getAgenda', () => {
    // noinspection ES6ModulesDependencies
    it('should get agenda', () => {
      // GIVEN
      // WHEN
      const agenda = getAgenda([{date: moment().format(), agenda: 'image'}]);
      // THEN
      agenda.should.equal('image');
    });
    it('should not get agenda', () => {
      // GIVEN
      // WHEN
      const agenda = getAgenda([{date: moment().add(1, 'd').format(), agenda: 'image'}]);
      // THEN
      should.not.exist(agenda);
    });
  })
});
