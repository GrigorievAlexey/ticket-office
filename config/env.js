'use strict';

const env = require(`./env/${process.env.NODE_ENV}`);
const defaultUser = require('./default-user');

Object.assign(env, { defaultUser });

module.exports = env;
