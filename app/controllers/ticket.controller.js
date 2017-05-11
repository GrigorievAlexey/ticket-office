/**
 * Created by alex on 5/11/17.
 */

'use strict';

const _ = require('lodash');
const log = require('config/log')(module);
const db = require('config/mongoose')
const Ticket = db.model('Ticket');
const HTTP_STATUSES = require('http-statuses');

module.exports = (req, res) => {
  log.info('Ticket controller');

  // Insert handling
  if (req.method === 'POST') {
    req.body.event = req.body.event || req.params.eventId;
    req.body.event = db.Types.ObjectId(req.body.event);
    let ticket = new Ticket(req.body);
    return ticket.save()
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
    if (req.params.eventId) {
      query.event = req.params.eventId;
    }
    return Ticket[findType](query)
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

    return Ticket.update(
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
    return Ticket.remove({_id: req.params.id})
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }
};