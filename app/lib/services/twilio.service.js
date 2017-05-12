/**
 * Created by alex on 5/11/17.
 */

'use strict';

const { accountSid, authToken, fromNumber } = require('config/env').twilio;
const twilio = require('twilio');
const client = new twilio(accountSid, authToken);


module.exports = {
  sendSmsTo(toNumber, message) {
    return client.messages.create({
        body: message,
        to: toNumber,
        from: fromNumber
      });
  },
};
