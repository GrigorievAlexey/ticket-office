/**
 * Created by alex on 5/10/17.
 */

'use strict';

const log = require('config/log')(module);

module.exports = (req, res, next) => {
  log.info('JWT handling will be here');
  next();
};
