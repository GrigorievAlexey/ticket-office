/**
 * Created by alex on 5/12/17.
 */

'use strict';

let { transport, mailOptions } = require('config/email');
const config = require('config/globals');
const moment = require('moment');
const log = require('config/log')(module);

module.exports = {
  sendEmail(options) {
    const { to, event, ticket } = options;
    mailOptions = Object.assign(mailOptions, {
      to,
      subject: `Ticket #${options.ticket._id} purchased`, // Subject line
      html: `<!DOCTYPE html>
              <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
              <head></head>
              <body>
                <p>Hello,</p>
                <p></p>
                <p>You've successfully purchased the ticket #${ticket.id} for the event "${event.name}".</p>
                <p>${event.description || ''}<p/>
                <p>The event will take place in ${event.place} ` +
                `on ${moment(event.date).format('dddd MMMM Do YYYY')} at ${moment(event.date).format('h:mm:ss a')}.<p/>
                <p>Enjoy the event and have a good time.</p>
                <br>
                <br>
                <p>The ${config.appName} Support Team</p>
              </body>
             </html>`,
    });
    return transport.sendMailAsync(mailOptions)
      .then((info) => {
        log.info('Message %s sent: %s', info.messageId, info.response);
      })
      .catch((err) => {
        log.error(err);
      });
  },
};

