/**
 * Created by alex on 5/13/17.
 */

'use strict';

module.exports = function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send(err.message);
};
