/**
 * Created by vedi on 08/07/16.
 */

'use strict';

const _ = require('lodash');
const Bb = require('bluebird');
const fetch = require('node-fetch');

const mongoose = require('config/mongoose');
const config = require('config/env');
const testConfig = require('test/config');

const User = mongoose.model('User');
const Event = mongoose.model('Event');
const Ticket = mongoose.model('Ticket');

const FIXTURE_TYPES = {
  USER: 'user.data',
  EVENT: 'event.data',
  TICKET: 'ticket.data',
};

// const clientAuth = {
//   client_id: testConfig.client.clientId,
//   client_secret: testConfig.client.clientSecret,
// };

const specHelper = {

  FIXTURE_TYPES,

  get(uri, options) {
    return this.request('GET', uri, undefined, options);
  },
  post(uri, body, options) {
    return this.request('POST', uri, body, options);
  },
  patch(uri, body, options) {
    return this.request('PATCH', uri, body, options);
  },
  put(uri, body, options) {
    return this.request('PUT', uri, body, options);
  },
  delete(uri, body, options) {
    return this.request('DELETE', uri, body, options);
  },
  request(method, uri, body, options) {
    options = Object.assign({
      method,
    }, options);

    if (!options.headers) {
      options.headers = {};
    }

    const { headers } = options;

    if (body) {
      options.body = JSON.stringify(body);
      Object.assign(headers, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
    }

    return fetch(uri, options)
      .then(res => Bb.join(res, res.json()))
      .then(([res, json]) => {
        res.body = json;
        return res;
      });
  },

  getFixture(fixtureType, seed) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const fixtureProvider = require(`./data/${fixtureType}`);
    if (_.isArray(fixtureProvider)) {
      if (_.isUndefined(seed)) {
        seed = Math.floor(Math.random() * fixtureProvider.length);
      } else if (!_.isNumber(seed) || seed >= fixtureProvider.length) {
        throw new Error(`Wrong seed value: ${seed}`);
      }

      return Object.assign({}, fixtureProvider[seed]);
    } else if (_.isFunction(fixtureProvider)) {
      seed = seed || Math.floor(Math.random() * 1000000);
      return fixtureProvider(seed);
    } else {
      throw new Error(`Unsupported fixture provider: ${fixtureType}`);
    }
  },

  getAuth(user = config.defaultUser) {
    return this.post(`${testConfig.baseUrl}/login`,
        {
          username: user.username,
          password: user.password,
        }
      )
      .then((result) => {
        return {
          Authorisation: `JWT ${result.token}`
        }
      })
  },

  // getClientAuth(client = testConfig.client) {
  //   return {
  //     client_id: client.clientId,
  //     client_secret: client.clientSecret,
  //   };
  // },

  // getBasicAuth(client) {
  //   const clientId = client ? client.clientId : clientAuth.client_id;
  //   const clientSecret = client ? client.clientSecret : clientAuth.client_secret;
  //
  //   return new Buffer(`${clientId}:${clientSecret}`).toString('base64');
  // },

  getAdminUser() {
    return Object.assign({}, config.defaultUser);
  },

  // fetchAndClearSentEmails() {
  //   return this
  //     .get(`${testConfig.baseUrl}/testing/sent-emails`)
  //     .then(result => result.body);
  // },

  signupUser({ data }) {
    return this
      .post(
        `${testConfig.baseUrl}/signup`,
        data,
        {}
      )
      .then((result) => {
        data._id = result.body._id;

        return result.body;
      });
  },
  createEvent({ data, user }) {
    return this
      .post(
        `${testConfig.baseUrl}/api/events`,
        data,
        {
          headers: {
            Authorization: `JWT ${user.auth.token}`,
          },
        }
      )
      .then((result) => {
        data._id = result.body._id;
        return result.body;
      });
  },

  createTicket({ data, user }) {
    return this
      .post(
        `${testConfig.baseUrl}/api/tickets`,
        data,
      {
        headers: {
          Authorization: `JWT ${user.auth.token}`,
        },
      }
      )
      .then((result) => {
        data._id = result.body._id;
        return result.body;
      });
  },

  logInUser({ data }) {
    return this
      .post(`${testConfig.baseUrl}/login`,
        Object.assign({
          grant_type: 'password',
        }, _.pick(data, 'username', 'password'))
      )
      .then((result) => {
        data.auth = {
          token: result.body.token,
        };
        return result.body;
      });
  },

  getUser({ userData, data, userId }) {
    data = data || userData;
    userId = userId || data._id;
    return this
      .get(`${testConfig.baseUrl}/api/users/${userId}`, {
        headers: {
          Authorization: `JWT ${userData.auth.token}`,
        },
      })
      .then((result) => {
        data._id = result.body._id;
        return result.body;
      });
  },

  removeUser(data) {
    return Bb
      .try(() => {
        if (data._id) {
          return User.remove({ _id: data._id });
        }
      });
  },

  removeEvent(data) {
    return Bb
      .try(() => {
        if (data._id) {
          return Event.remove({ _id: data._id });
        }
      });
  },

  removeTicket(data) {
    return Bb
      .try(() => {
        if (data._id) {
          return Event.remove({ _id: data._id });
        }
      });
  },

};

before(() => Bb
  .join(
    Ticket.remove(),
    Event.remove(),
    User.remove({ username: { $ne: config.defaultUser.username } })
  ));

module.exports = specHelper;
