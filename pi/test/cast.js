process.env.NODE_ENV = 'test';

const DisplayService = require('../app/cast');

describe('Display', () => {
  it('Play 2 times without closing connection', // eslint-disable-next-line
    function (done) {
      this.timeout(30000);
      const service = new DisplayService();

      const media = 'http://blog.xebia.fr/wp-content/themes/wp-xebiafr-2016/images/sidebar-xebia-logo.png';

      service.connect()
        .then(() => service.displayImage(media))
        .then(() => done())
        .catch(done);
    });
});
