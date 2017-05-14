/**
 * Created by alex on 2/14/17.
 */

'use strict';

const chakram = require('chakram');
const moment = require('moment');

const testConfig = require('test/config');
const specHelper = require('test/spec-helper');

const expect = chakram.expect;

describe('Event', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const otherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const event = specHelper.getFixture(specHelper.FIXTURE_TYPES.EVENT);

  before('create and sign in user', () => specHelper
    .signupUser({ data: user })
    .then(specHelper.logInUser.bind(specHelper, { data: user })));

  before('create and sign in otherUser', () => specHelper
    .signupUser({ data: otherUser })
    .then(specHelper.logInUser.bind(specHelper, { data: otherUser })));

  describe('Create event', () => {
    let response;

    before('send post', () => chakram
      .post(`${testConfig.baseUrl}/api/events`, event, {
        headers: {
          Authorization: `JWT ${user.auth.token}`,
        },
      })
      .then((result) => {
        response = result;
      }));

    it('should return status 201', () => expect(response).to.have.status(201));

    it('should contain _id', () => {
      event._id = response.body._id;
      return expect(response.body._id).to.exist;
    });
  });

  describe('Get events list', () => {
    let response;

    before('send get', () => chakram
      .get(`${testConfig.baseUrl}/api/events`,
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
      .get(`${testConfig.baseUrl}/api/events/${event._id}`,
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
      expect(response).to.have.json('_id', event._id);
    });
  });

  describe('Change event', () => {
    const NEW_DATE = moment().toISOString();

    let response;

    before('send request', () => chakram
      .patch(`${testConfig.baseUrl}/api/events/${event._id}`,
        {
          date: NEW_DATE,
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

    it('should contain new date', () => {
      expect(response).to.have.json('date', NEW_DATE);
    });
  });

  describe('Remove Event', () => {
    let response;

    before('send request', () => chakram
      .delete(`${testConfig.baseUrl}/api/events/${event._id}`,
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

  after('remove event', () => specHelper.removeEvent(event));

  after('remove user', () => specHelper.removeUser(user));

  after('remove otherUser', () => specHelper.removeUser(otherUser));
});
