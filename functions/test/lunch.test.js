// noinspection JSUnusedLocalSymbols
const should = require('chai').should();
const {getWhatForLunch} = require('../lunch');
const moment = require('moment');

describe('Lunch', () => {
  describe('getWhatForLunch', () => {
    // noinspection ES6ModulesDependencies
    it('should get content for lunch', () => {
      // GIVEN
      // WHEN
      const whatForLunch = getWhatForLunch([{date: moment().format(), content: 'tasty menu!'}]);
      // THEN
      whatForLunch.should.equal('tasty menu!');
    });
    it('should get nothing for lunch', () => {
      // GIVEN
      // WHEN
      const whatForLunch = getWhatForLunch([{date: moment().add(1, 'd').format(), content: 'tasty menu!'}]);
      // THEN
      should.not.exist(whatForLunch);
    });
  })
});
