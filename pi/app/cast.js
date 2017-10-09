const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
const Promise = require('bluebird');
const nodecastor = require('nodecastor');

const logger = require('./logger');

class DisplayService {
  constructor() {
    this.player = null;
    this.client = null;
    this.browser = null;
    this.status = null;
    this.resolve = null;
    this.reject = null;
  }

  connect() {
    const display = this;
    return new Promise((resolve, reject) => {
      nodecastor.scan()
        .on('online', function (device) {
          if (device.friendlyName == process.argv[2]) {
            display.launchMediaReceiver(device, resolve, reject)
          }
        })
        .start();
    });
  }

  launchMediaReceiver(device, resolve, reject) {
    this.client = new Client();

    this.client.connect(device.address, () => {
      logger.info(`connected to ${device.friendlyName}, launching app`);

      this.client.launch(DefaultMediaReceiver, (err, player) => {
        if (err) {
          logger.error(`an error occurred ${err.message}`);
          this.client.close();
          reject(err);
          return;
        }

        this.player = player;

        this.player.on('status', (status) => {
          logger.info(`status broadcast player state ${status.playerState}`);
          if (this.status === 'PLAYING' && status.playerState === 'IDLE') {
            this.status = null;
            this.resolve();
            return;
          }
          this.status = status.playerState;
        });

        resolve();
      });

      this.client.on('error', (err) => {
        logger.error(`an error occurred ${err.message}`);
        this.client.close();
        reject(err);
      });
    });
  }

  playContent(contentId, contentType) {
    const media = {
      contentId,
      contentType: contentType
    };
    logger.info(`app ${this.player.session.displayName} launched, loading media ${contentId}...`);
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.player.load(media, {
        autoplay: true,
      }, (err2, status) => {
        if (err2) {
          logger.error(`an error occurred ${err2.message}`);
          this.client.close();
          this.reject();
          return;
        }
        logger.info(`media loaded player state ${status.playerState}`);
      });
    });
  }

  disconnect() {
    logger.info('disconnecting');
    this.client.close();
    this.browser.stop();
  }
}

module.exports = DisplayService;
