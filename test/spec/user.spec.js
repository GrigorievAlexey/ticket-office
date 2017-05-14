'use strict';

const chakram = require('chakram');

const testConfig = require('test/config');
const specHelper = require('test/spec-helper');

const expect = chakram.expect;

describe('User', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const otherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);


  describe('Sign up user', () => {
    let response;

    before('send post', () => chakram
      .post(
        `${testConfig.baseUrl}/signup`,
        Object.assign({}, user),
        {}
      )
      .then((result) => {
        response = result;
      }));

    it('should return status 201', () => expect(response).to.have.status(201));

    it('should contain _id', () => {
      user._id = response.body._id;
      return expect(response.body._id).to.exist;
    });

    after('sign in user', () => specHelper.logInUser({ data: user }));
  });

  describe('Sign up otherUser', () => {
    let response;

    before('send post', () => chakram
      .post(
        `${testConfig.baseUrl}/signup`,
        otherUser,
        {}
      )
      .then((result) => {
        response = result;
      }));

    it('should return status 201', () => expect(response).to.have.status(201));

    it('should contain _id', () => {
      otherUser._id = response.body._id;
      return expect(response.body._id).to.exist;
    });

    after('sign in otherUser', () => specHelper.logInUser({ data: otherUser }));
  });

  describe('Get user list', () => {
    let response;

    before('send post', () => chakram
      .get(`${testConfig.baseUrl}/api/users`)
      .then((result) => {
        response = result;
      }));

    it('should return status 401', () => {
      expect(response).to.have.status(401);
    });
  });

  describe('Get user list with auth', () => {
    let response;

    before('send post', () => chakram
      .get(`${testConfig.baseUrl}/api/users`,
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
  });

  describe('Get Profile', () => {
    let response;

    before('send request', () => chakram
      .get(`${testConfig.baseUrl}/api/users/me`,
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
      expect(response).to.have.json('_id', user._id);
    });

    it('should be the same username', () => {
      expect(response).to.have.json('username', user.username.toLowerCase());
    });

    it('should be the same name', () => {
      expect(response).to.have.json('phoneNumber', user.phoneNumber);
    });
  });

  describe('Get Profile by otherUser', () => {
    let response;

    before('send request', () => chakram
      .get(`${testConfig.baseUrl}/api/users/${user._id}`,
      {
        headers: {
          Authorization: `JWT ${otherUser.auth.token}`,
        },
      })
      .then((result) => {
        response = result;
      }));

    it('should return status 403', () => {
      expect(response).to.have.status(403);
    });
  });

  describe('Change Profile', () => {
    const NEW_VALUE = '+12345678901';

    let response;

    before('send request', () => chakram
      .patch(`${testConfig.baseUrl}/api/users/me`,
      {
        phoneNumber: NEW_VALUE,
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

    it('should change phone', () => {
      expect(response).to.have.json('phoneNumber', NEW_VALUE);
    });
  });

  describe('Remove Profile', () => {
    let response;

    before('send request', () => chakram
      .delete(`${testConfig.baseUrl}/api/users/me`,
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

  after('remove user', () => specHelper.removeUser(user));

  after('remove otherUser', () => specHelper.removeUser(otherUser));
});
