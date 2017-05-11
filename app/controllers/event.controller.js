/**
 * Created by alex on 5/10/17.
 */

'use strict';

const log = require('config/log')(module);
const db = require('config/mongoose');
const Event = db.model('Event');
const HTTP_STATUSES = require('http-statuses');

module.exports = (req, res) => {
  log.info('Event controller');

  // Insert handling
  if (req.method === 'POST') {
    let event = new Event(req.body);
    return event.save()
      .then((result) => {
        res.send(result);
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
  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.params.id) {
      return res.send(HTTP_STATUSES.BAD_REQUEST.createError('Id should be specified'));
    }
    return Event.update(
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
    return Event.remove({_id: req.params.id})
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }
};
