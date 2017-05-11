/**
 * Created by alex on 5/9/17.
 */
'use strict';
const express = require('express');
const log = require('./log')(module);
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const apiRouter = require('app/routes/api.routes');

module.exports = () => {
  const app = express();

  require('app/lib/middleware/request-log')(app);

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(multipart());
  app.use(bodyParser.json());
  // app.use(require('app/lib/middleware/extract-client-oauth2')());
  app.use(methodOverride());

  app.use(cookieParser());

  require('app/lib/middleware/helmet')(app);
  app.use('/api', apiRouter);
  log.info('Starting app...');
  return app;
};
