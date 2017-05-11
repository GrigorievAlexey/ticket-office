/**
 * Created by alex on 5/10/17.
 */

'use strict';

const _ = require('lodash');
const log = require('config/log')(module);
const User = require('config/mongoose').model('User');
const HTTP_STATUSES = require('http-statuses');

module.exports = (req, res) => {
  log.info('User controller');

  // Insert handling
  if (req.method === 'POST') {
    let user = new User(req.body);
    return user.save()
      .then((result) => {
        let savedUser = _.pick(result, ['_id', 'username', 'createdAt']);
        res.send(savedUser);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }

  // Select handling
  if (req.method === 'GET') {
    let query = req.params.id ? {_id: req.params.id} : {};
    let findType = req.params.id ? 'findOne' : 'find';
    return User[findType](query, {
      username: true,
      createdAt: true,
    })
      .then((result) => {
        if (!result) {
          throw HTTP_STATUSES.NOT_FOUND.createError();
        }
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }

  // Update handling
  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.params.id) {
      return res.send(HTTP_STATUSES.BAD_REQUEST.createError('Id should be specified'));
    }
    return User.update(
      {_id: req.params.id},
      req.body,
      {upsert: true}
    )
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }

  // Delete handling
  if (req.method === 'DELETE') {
    if (!req.params.id) {
      return res.send(HTTP_STATUSES.BAD_REQUEST.createError('Id should be specified'));
    }
    return User.remove({_id: req.params.id})
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }
};
