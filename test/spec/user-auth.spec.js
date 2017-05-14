'use strict';

const chakram = require('chakram');

const mongoose = require('config/mongoose');
const testConfig = require('test/config');
const specHelper = require('test/spec-helper');

const User = mongoose.model('User');
const expect = chakram.expect;

let userDoc;

describe('User Auth', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  user.phoneNumber = '+380953118809';
  const otherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  otherUser.phoneNumber = '+380953118809';

  before('create and sign in user', () => specHelper
      .signupUser({ data: user })
      .then(specHelper.logInUser.bind(specHelper, { data: user })));

  before('create and sign in otherUser', () => specHelper
      .signupUser({ data: otherUser })
      .then(specHelper.logInUser.bind(specHelper, { data: otherUser })));

  describe('Forgot password for not existing user', () => {
    let response;

    before('send request', () => chakram
        .post(
          `${testConfig.baseUrl}/forgot`,
          { username: 'someFakeUserName' }
        )
        .then((result) => {
          response = result;
        }));

    it('should return status 400', () => expect(response).to.have.status(400));
  });

  describe('Forgot password', () => {
    let response;

    before('send request', () => chakram
        .post(
          `${testConfig.baseUrl}/forgot`,
          { username: user.username }
        )
        .then((result) => {
          response = result;
        }));

    before('wait event processing', (done) => {
      setTimeout(done, 500);
    });

    before('fetch user from db', () => User
        .findOne({ _id: user._id }).select('verificationCode').lean().exec()
        .then((result) => { userDoc = result; }));

    it('should return status 204', () => expect(response).to.have.status(204));

    it('should set reset token for user in db', () => expect(userDoc.verificationCode).to.exist);

  });

  describe('Reset password', () => {
    let response;

    before('send request', () => {
      user.password = 'completelyOtherPassword';

      return chakram
        .post(
          `${testConfig.baseUrl}/reset`,
          {
            username: user.username,
            newPassword: user.password,
            verificationCode: userDoc.verificationCode,
          }
        )
        .then((result) => {
          response = result;
        });
    });

    before('wait event processing', (done) => {
      setTimeout(done, 500);
    });

    it('should return status 204', () => expect(response).to.have.status(204));

    before('sign in with new password', () =>
       specHelper.logInUser({ data: user }));
  });

  describe('Reset password using the same token', () => {
    let response;

    before('send request', () => {
      user.password = 'completelyOtherPassword';

      return chakram
        .post(
          `${testConfig.baseUrl}/reset`,
          { newPassword: user.password }
        )
        .then((result) => {
          response = result;
        });
    });

    it('should return status 400', () => expect(response).to.have.status(400));
  });

  describe('Reset password using random token', () => {
    let response;

    before('send request', () => {
      user.password = 'completelyOtherPassword';

      return chakram
        .post(
          `${testConfig.baseUrl}/reset`,
          { newPassword: user.password }
        )
        .then((result) => {
          response = result;
        });
    });

    it('should return status 400', () => expect(response).to.have.status(400));
  });

  after('remove user', () => specHelper.removeUser(user));

  after('remove otherUser', () => specHelper.removeUser(otherUser));
});
