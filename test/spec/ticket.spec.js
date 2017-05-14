/**
 * Created by alex on 2/14/17.
 */

'use strict';

const chakram = require('chakram');
const moment = require('moment');

const testConfig = require('test/config');
const specHelper = require('test/spec-helper');

const expect = chakram.expect;

describe('Ticket', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const otherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const event = specHelper.getFixture(specHelper.FIXTURE_TYPES.EVENT);
  const otherEvent = specHelper.getFixture(specHelper.FIXTURE_TYPES.EVENT);
  const ticket = {};

  before('create and sign in user', () => specHelper
    .signupUser({ data: user })
    .then(specHelper.logInUser.bind(specHelper, { data: user })));

  before('create and sign in otherUser', () => specHelper
    .signupUser({ data: otherUser })
    .then(specHelper.logInUser.bind(specHelper, { data: otherUser })));

  before('create event', () => specHelper
    .createEvent({ data: event, user }));

  before('create other event', () => specHelper
    .createEvent({ data: otherEvent, user }));

  describe('Create ticket', () => {
    let response;

    before('send post', () => chakram
      .post(`${testConfig.baseUrl}/api/events/${event._id}/tickets`, ticket, {
        headers: {
          Authorization: `JWT ${user.auth.token}`,
        },
      })
      .then((result) => {
        response = result;
      }));

    it('should return status 201', () => expect(response).to.have.status(201));

    it('should contain _id', () => {
      ticket._id = response.body._id;
      return expect(response.body._id).to.exist;
    });
  });

  describe('Get tickets list', () => {
    let response;

    before('send get', () => chakram
      .get(`${testConfig.baseUrl}/api/events/${event._id}/tickets`,
        {
          headers: {
            Authorization: `JWT ${user.auth.token}`,
          },
        })
      .then((result) => {
        response = result;
      }));

    it('should return status 200', () => {
      expect(response).to.have.status(200);
    });

    it('should return not empty array', () => {
      expect(response.body).to.be.an('array')
        .and.to.have.length.above(0);
    });
  });

  describe('Get one', () => {
    let response;

    before('send request', () => chakram
      .get(`${testConfig.baseUrl}/api/events/${event._id}/tickets/${ticket._id}`,
        {
          headers: {
            Authorization: `JWT ${user.auth.token}`,
          },
        })
      .then((result) => {
        response = result;
      }));

    it('should return status 200', () => {
      expect(response).to.have.status(200);
    });

    it('should be the same _id', () => {
      expect(response).to.have.json('_id', ticket._id);
    });
  });

  describe('Change ticket', () => {
    let response;

    before('send request', () => chakram
      .patch(`${testConfig.baseUrl}/api/tickets/${ticket._id}`,
        {
          event: otherEvent._id,
        },
        {
          headers: {
            Authorization: `JWT ${user.auth.token}`,
          },
        }
      )
      .then((result) => {
        response = result;
      }));

    it('should return status 200', () => {
      expect(response).to.have.status(200);
    });

    it('should contain other event id', () => {
      expect(response).to.have.json('event', otherEvent._id.toString());
    });
  });

  describe('Remove Ticket', () => {
    let response;

    before('send request', () => chakram
      .delete(`${testConfig.baseUrl}/api/users/me/tickets/${ticket._id}`,
        {},
        {
          headers: {
            Authorization: `JWT ${user.auth.token}`,
          },
        }
      )
      .then((result) => {
        response = result;
      }));

    it('should return status 204', () => {
      expect(response).to.have.status(204);
    });
  });

  after('remove ticket', () => specHelper.removeTicket(ticket));

  after('remove user', () => specHelper.removeUser(user));

  after('remove otherUser', () => specHelper.removeUser(otherUser));
});
