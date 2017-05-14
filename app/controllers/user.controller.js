/**
 * Created by alex on 5/10/17.
 */

'use strict';

const _ = require('lodash');
const log = require('config/log')(module);
const User = require('config/mongoose').model('User');
const HTTP_STATUSES = require('http-statuses');

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
  console.log(req.params);

  if (req.params.id && req.params.id !== 'me' && req.params.id !== req.user._id.toString()) {
    return res.status(HTTP_STATUSES.FORBIDDEN.code).send(new Error('User can review own profile only'));
  }

  if (req.params.id === 'me') {
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
      res.status(err.httpStatus && err.httpStatus.code || 500).send(err);
    });
}

// Update handling
function update(req, res) {
  if (!req.params.id) {
    return res.send(HTTP_STATUSES.BAD_REQUEST.createError('Id should be specified'));
  }

  if (req.params.id && req.params.id !== 'me' && req.params.id !== req.user._id.toString()) {
    return res.status(HTTP_STATUSES.FORBIDDEN.code).send(new Error('User can change own profile only'));
  }

  if (req.params.action === 'me' || req.params.id === 'me') {
    req.params.id = req.user._id
  }

  return User.findOneAndUpdate(
    {_id: req.params.id},
    req.body,
    {
      upsert: true,
      new: true
    }
  )
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      log.error(err);
      res.status(err.httpStatus && err.httpStatus.code || 500).send(err);
    });
}

// Delete handling
function remove(req, res) {
  if (!req.params.id) {
    return res.send(HTTP_STATUSES.BAD_REQUEST.createError('Id should be specified'));
  }
  if (req.params.id === 'me') {
    req.params.id = req.user._id
  }
  return User.remove({_id: req.params.id})
    .then((result) => {
      res.status(HTTP_STATUSES.NO_CONTENT.code).send(result);
    })
    .catch((err) => {
      log.error(err);
      res.status(err.httpStatus && err.httpStatus.code || 500).send(err);
    });
}

module.exports = function (router) {
  let routes = ['/users/:id?'];

  router.get(routes, find);
  router.post(routes, insert);
  router.put(routes, update);
  router.patch(routes, update);
  router.delete(routes, remove);
};
