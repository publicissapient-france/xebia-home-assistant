// noinspection JSUnusedLocalSymbols
const should = require('chai').should();
const {getConference, sortByDate, getNextSlot} = require('../agenda');
const moment = require('moment');

describe('Planning', () => {
  describe('getAgenda', () => {
    // noinspection ES6ModulesDependencies
    it('should get agenda', () => {
      // GIVEN
      // WHEN
      const conf = getConference([{date: moment().format(), agenda: 'image'}]);
      // THEN
      // noinspection JSUnresolvedVariable
      conf.agenda.should.equal('image');
    });
    it('should not get agenda', () => {
      // GIVEN
      // WHEN
      // noinspection JSCheckFunctionSignatures, JSDeprecatedSymbols
      const conf = getConference([{date: moment().add(1, 'd').format(), agenda: 'image'}]);
      // THEN
      should.not.exist(conf);
    });
  });
  describe('sortByDate', () => {
    // noinspection ES6ModulesDependencies
    it('should sort', () => {
      // GIVEN
      // WHEN
      // noinspection JSCheckFunctionSignatures, JSDeprecatedSymbols
      const conferencesByDate = sortByDate([{date: moment().add(1, 'd').format(), id: 0}, {
        date: moment().format(),
        id: 1
      }]);
      // THEN
      conferencesByDate[0].id.should.equal(1);
      conferencesByDate[1].id.should.equal(0);
    });
  });
  describe('getNextSlot', () => {
    // noinspection ES6ModulesDependencies
    it('should get slot', () => {
      // GIVEN
      // WHEN
      // noinspection JSCheckFunctionSignatures, JSDeprecatedSymbols
      const slot = getNextSlot([{
        date: moment().subtract(1, 'd').format(),
        slot: [
          {
            id: 0,
            date: moment().format(),
          }
        ],
      }, {
        date: moment().format(),
        slot: [
          {
            id: 1,
            date: moment().subtract(1, 'h').format(),
          },
          {
            id: 2,
            date: moment().add(10, 'm').format(),
          },
        ],
      }]);
      // THEN
      // noinspection JSUnresolvedVariable
      slot.id.should.equal(2);
    });
    it('should not get slot', () => {
      // GIVEN
      // WHEN
      // noinspection JSCheckFunctionSignatures, JSDeprecatedSymbols
      const time = getNextSlot(
        [{
          date: moment().format(),
          slot: [
            {
              date: moment().format(),
            },
            {
              date: moment().format(),
            },
          ],
        }]);
      // THEN
      should.not.exist(time);
    });
  });
  describe('getNextBreak', () => {
    // noinspection ES6ModulesDependencies
    it('should get time', () => {
      // GIVEN
      // WHEN
      // noinspection JSCheckFunctionSignatures, JSDeprecatedSymbols
      const slot = getNextSlot([{
        date: moment().subtract(1, 'd').format(),
        slot: [
          {
            id: 0,
            date: moment().format(),
            type: 'break',
          }
        ],
      }, {
        date: moment().format(),
        slot: [
          {
            id: 1,
            date: moment().subtract(1, 'h').format(),
            type: 'break',
          },
          {
            id: 2,
            date: moment().add(10, 'm').format(),
            type: 'break',
          },
        ],
      }]);
      // THEN
      // noinspection JSUnresolvedVariable
      slot.id.should.equal(2);
    });
    it('should not get time', () => {
      // GIVEN
      // WHEN
      // noinspection JSCheckFunctionSignatures, JSDeprecatedSymbols
      const time = getNextSlot(
        [{
          date: moment().format(),
          slot: [
            {
              date: moment().format(),
              type: 'break',
            },
            {
              date: moment().format(),
              type: 'break',
            },
          ],
        }]);
      // THEN
      should.not.exist(time);
    });
  });
});
