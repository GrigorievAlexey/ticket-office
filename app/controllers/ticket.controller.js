/**
 * Created by alex on 5/11/17.
 */

'use strict';

const _ = require('lodash');
const log = require('config/log')(module);
const db = require('config/mongoose')
const Ticket = db.model('Ticket');
const HTTP_STATUSES = require('http-statuses');
const reservationService = require('app/lib/services/reservation.service');
const stripe = require('app/lib/services/stripe.service');

// Actions handling
function actions(req, res)  {
  // Reservation handling
  if (req.params.action === 'reserve' && req.method === 'POST') {
    return reservationService.reserve(req.params.id, req.user)
      .then(() => {
        return res.send({message: 'Reservation complete'});
      })
      .catch((err) => {
        log.error(err);
        return res.status(err.httpStatus && err.httpStatus.code || 500)
          .send('Reservation failed: ' + err.message);
      });
  }
  // Buying handling
  if (req.params.action === 'buy' && req.method === 'POST') {
    if (!req.body.token) {
      return res.status(HTTP_STATUSES.BAD_REQUEST.code).send({message: 'Token should be specified'});
    }
    return stripe.buyTicket({
      ticketId: req.params.id,
      customer: req.user,
      token: req.body.token,
    })
      .then(() => {
        return res.send({message: 'Ticket purchased'});
      })
      .catch((err) => {
        log.error(err);
        return res.status(err.httpStatus && err.httpStatus.code || err.statusCode || 500)
          .send({message: 'Purchase failed: ' + err.message});
      });
  }
  return res.status(HTTP_STATUSES.BAD_REQUEST.code).send('No such action');
}

// Insert handling
function insert(req, res)  {
  req.body.event = req.body.event || req.params.eventId;
  req.body.event = db.Types.ObjectId(req.body.event);
  let ticket = new Ticket(req.body);
  return ticket.save()
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
  if (req.params.userId === 'me') {
    req.params.userId = req.user._id
  }
  let query = req.params.id ? {_id: req.params.id} : {};
  let findType = req.params.id ? 'findOne' : 'find';
  if (req.params.eventId) {
    query.event = req.params.eventId;
  }
  if (req.params.userId) {
    query.owner = req.params.userId;
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
function update(req, res) {
  if (!req.params.id) {
    return res.status(HTTP_STATUSES.BAD_REQUEST.code).send({message: 'Id should be specified'});
  }

  return Ticket.findOneAndUpdate(
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
  return Ticket.remove({_id: req.params.id})
    .then((result) => {
      res.status(HTTP_STATUSES.NO_CONTENT.code).send(result);
    })
    .catch((err) => {
      log.error(err);
      res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
    });
}

module.exports = function (router) {
  let routes = [
    '/tickets/:id?',
    '/events/:eventId/tickets/:id?',
    '/users/:userId/tickets/:id?',
  ];
  let actionRoutes = [
    '/tickets/:id/:action',
    '/events/:eventId/tickets/:id/:action',
    '/users/:userId/tickets/:id/:action',
  ];

  router.all(actionRoutes, actions);
  router.get(routes, find);
  router.post(routes, insert);
  router.put(routes, update);
  router.patch(routes, update);
  router.delete(routes, remove);
};


