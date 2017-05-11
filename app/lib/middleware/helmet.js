'use strict';

const helmet = require('helmet');

module.exports = (app) => {
  // Use helmet to secure Express headers
  app.use(helmet.frameguard());
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.hidePoweredBy());
};
