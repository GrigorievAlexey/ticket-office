/**
 * Created by alex on 5/11/17.
 */

"use strict";

const schedule = require('node-schedule');
const { reservationPeriod } = require('config/globals');
const log = require('config/log')(module);
const Ticket = require('config/mongoose').model('Ticket');
const HTTP_STATUSES = require('http-statuses');

module.exports = {
  reserve(ticketId, user) {
    return Ticket.findById(ticketId)
      .then((ticket) => {
        if (!ticket) {
          throw HTTP_STATUSES.NOT_FOUND.createError('Cannot find such ticket');
        }
        if (ticket.status !== Ticket.TICKET_STATUSES.AVAILABLE) {
          throw HTTP_STATUSES.BAD_REQUEST.createError('Cannot reserve this ticket')
        }
        ticket.status = Ticket.TICKET_STATUSES.RESERVED;
        ticket.owner = user._id;
        return ticket.save()
      })
      .then(() => {
        log.info(`The ticket #${ticketId} has been reserved`);
        let date = Date.now() + reservationPeriod;
        schedule.scheduleJob(date, () => {
          return Ticket.findById(ticketId)
            .then((ticket) => {
              if (!ticket) {
                throw new Error('Cannot find such ticket');
              }
              if (ticket.status !== Ticket.TICKET_STATUSES.RESERVED) {
                throw new Error('Cannot cancel reservation for this ticket')
              }
              ticket.status = Ticket.TICKET_STATUSES.AVAILABLE;
              return ticket.save();
            })
            .then(() => {
              log.info(`Reservation for ticket #${ticketId} has been cancelled`);
            })
            .catch((err) => {
              log.error(err);
            });
        });
        return 'Success';
      });
  },
};


