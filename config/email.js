/**
 * Created by alex on 5/12/17.
 */


'use strict';

const Bb = require('bluebird');
const nodemailer = require('nodemailer');
const config = require('config/env');

module.exports = {
  transport: Bb.promisifyAll(nodemailer.createTransport(config.email.options)),
  mailOptions: { from: config.email.from },
};
