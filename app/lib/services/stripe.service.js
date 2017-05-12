/**
 * Created by alex on 5/12/17.
 */

'use strict';

const { secretKey } = require('config/env').stripe;
const stripe = require('stripe')(secretKey);
const log = require('config/log')(module);
const Ticket = require('config/mongoose').model('Ticket');
const HTTP_STATUSES = require('http-statuses');
const TICKET_STATUSES = Ticket.TICKET_STATUSES;
const emailService = require('app/lib/services/email.service');

function cantPurchase(ticket, customer) {
  return ticket.status === TICKET_STATUSES.BOUGHT ||
    (ticket.status === TICKET_STATUSES.RESERVED && !ticket.owner.equals(customer._id));
}

module.exports = {
  buyTicket(options) {
    let context = {};
    return Ticket.findById(options.ticketId)
      .populate('event')
      .then((ticket) => {
        if (!ticket) {
          throw HTTP_STATUSES.NOT_FOUND.createError('No ticket to buy');
        }
        if (cantPurchase(ticket, options.customer)) {
          throw HTTP_STATUSES.BAD_REQUEST.createError('Ticket cannot be purchased');
        }
        context.ticket = ticket;
        return stripe.charges.create({
          amount: ticket.event.price * 100, // since stripe use cents here
          currency: 'usd',
          description: `Purchasing ticket for "${ticket.event.name}" event by ${options.customer.username} user`,
          source: options.token,
        });
      })
      .then(() => {
        context.ticket.status = TICKET_STATUSES.BOUGHT;
        context.ticket.owner = options.customer._id;
        return context.ticket.save();
      })
      .then(() => {
        return emailService.sendEmail({
          to: options.customer.username,
          ticket: context.ticket,
          event: context.ticket.event
        })
      });
  }
};
