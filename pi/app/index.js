const express = require('express');
const logger = require('./logger');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('xebia-home-assistant pi works!');
});

app.listen(3000, () => {
  logger.info(`App running in ${process.env.NODE_ENV} mode on port 3000 > http://localhost:3000/`);
});
