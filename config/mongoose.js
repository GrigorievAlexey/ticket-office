/**
 * Created by alex on 5/10/17.
 */

'use strict';

const mongoose = require('mongoose');
const config = require('config/env');
const Bb = require('bluebird');
const log = require('config/log')(module);

mongoose.Promise = Bb;

mongoose.connect(config.mongo, (err) => {
  if (err) {
    log.error('Cannot connect to mongo');
    return console.log(err);
  }
  log.info(`Connected to mongodb: ${config.mongo}`);
});

require('app/models/user.model')(mongoose);
require('app/models/event.model')(mongoose);
require('app/models/ticket.model')(mongoose);

module.exports = mongoose;
