/**
 * Created by alex on 5/10/17.
 */

'use strict';

const _ = require('lodash');
const log = require('config/log')(module);
const db = require('config/mongoose');
const Event = db.model('Event');
const HTTP_STATUSES = require('http-statuses');

// Insert handling
function insert(req, res) {
  let event = new Event(req.body);
  return event.save()
    .then((result) => {
      res.status(HTTP_STATUSES.CREATED.code).send(result);
    })
    .catch((err) => {
      log.error(err);
      res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
    });
}

// Select handling
function find(req, res) {
  let query = req.params.id ? {_id: req.params.id} : {};
  let findType = req.params.id ? 'findOne' : 'find';
  return Event[findType](query)
    .populate('tickets')
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
  return Event.findOneAndUpdate(
      {_id: req.params.id},
      req.body,
      {
        upsert: true,
        new: true,
      }
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
  return Event.remove({_id: req.params.id})
    .then((result) => {
      res.status(HTTP_STATUSES.NO_CONTENT.code).send(result);
    })
    .catch((err) => {
      log.error(err);
      res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
    });
}


module.exports = function (router) {
  let routes = ['/events/:id?'];

  router.get(routes, find);
  router.post(routes, insert);
  router.put(routes, update);
  router.patch(routes, update);
  router.delete(routes, remove);
};
