/**
 * Created by alex on 5/10/17.
 */

'use strict';

const morgan = require('morgan');

module.exports = (app) => {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
};
