/**
 * Created by alex on 5/10/17.
 */

'use strict';

const _ = require('lodash');
const log = require('config/log')(module);
const User = require('config/mongoose').model('User');
const HTTP_STATUSES = require('http-statuses');
const twilio = require('app/lib/services/twilio.service');

// Insert handling
function insert(req, res) {
  let user = new User(req.body);
  return user.save()
    .then((result) => {
      let savedUser = _.pick(result, ['_id', 'username', 'createdAt', 'phoneNumber']);
      res.send(savedUser);
    })
    .catch((err) => {
      log.error(err);
      res.status(err.httpStatus && err.httpStatus.code || 500).send(err);
    });
}

// Select handling
function find(req, res) {
  if (req.params.action === 'me' || req.params.id === 'me') {
    req.params.id = req.user._id
  }
  let query = req.params.id ? {_id: req.params.id} : {};
  let findType = req.params.id ? 'findOne' : 'find';
  return User[findType](query, {
    hashedPassword: false,
    salt: false,
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
function update(req, res) {
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
function remove(req, res) {
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

module.exports = function (router) {
  let routes = ['/users/:id?'];
  // let actionRoutes = ['/users/:action', '/users/:id/:action'];

  // router.all(actionRoutes, actions);
  router.get(routes, find);
  router.post(routes, insert);
  router.put(routes, update);
  router.delete(routes, remove);
};
