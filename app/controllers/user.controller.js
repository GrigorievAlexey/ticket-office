/**
 * Created by alex on 5/10/17.
 */

'use strict';

const _ = require('lodash');
const log = require('config/log')(module);
const User = require('config/mongoose').model('User');
const HTTP_STATUSES = require('http-statuses');
const twilio = require('app/lib/services/twilio.service');

module.exports = (req, res) => {
  log.info('User controller');

  // Actions handling
  if (req.params.action) {

    // Forgot password action
    if (req.params.action === 'forgot' && req.method === 'POST') {
      if (!req.body.username) {
        return res.status(HTTP_STATUSES.BAD_REQUEST.code).send('Username should be specified');
      }
      return User.findOne({username: req.body.username})
        .then((user) => {
          console.dir(user);
          console.dir(req.body.username);
          if (!user) {
            throw HTTP_STATUSES.NOT_FOUND.createError('No user with such username');
          }
          user.verificationCode = Math.random().toString(10).substr(2, 6);
          return user.save();
        })
        .then((user) => {
          return twilio.sendSmsTo(user.phoneNumber, `Verification code: ${user.verificationCode}`);
        })
        .then(() => {
          return res.send({message: 'Verification code was sent'});
        })
        .catch((err) => {
          res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
        });
    }

    // Restore password action
    if (req.params.action === 'reset' && req.method === 'POST') {
      if (!req.body.verificationCode || !req.body.username || !req.body.newPassword) {
        return res
          .status(HTTP_STATUSES.BAD_REQUEST.code)
          .send('Verification code, username and new password should be specified');
      }
      return User.findOne({username: req.body.username})
        .then((user) => {
          if (!user) {
            throw HTTP_STATUSES.NOT_FOUND.createError('No user with such username');
          }
          if (user.verificationCode !== req.body.verificationCode) {
            throw HTTP_STATUSES.BAD_REQUEST.createError('Wrong verification code');
          }
          user.password = req.body.newPassword;
          return user.save();
        })
        .then(() => {
          res.send({message: 'Password successfully changed'})
        })
        .catch((err) => {
          res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
        });
    }

  }

  // Insert handling
  if (req.method === 'POST') {
    let user = new User(req.body);
    return user.save()
      .then((result) => {
        let savedUser = _.pick(result, ['_id', 'username', 'createdAt', 'phoneNumber']);
        res.send(savedUser);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err);
      });
  }

  // Select handling
  if (req.method === 'GET') {
    if (req.params.action === 'me' || req.params.id === 'me') {
      req.params.id = req.user._id
    }
    let query = req.params.id ? {_id: req.params.id} : {};
    let findType = req.params.id ? 'findOne' : 'find';
    return User[findType](query, {
      username: true,
      createdAt: true,
    })
      .then((result) => {
        if (!result) {
          throw HTTP_STATUSES.NOT_FOUND.createError();
        }
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }

  // Update handling
  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.params.id) {
      return res.send(HTTP_STATUSES.BAD_REQUEST.createError('Id should be specified'));
    }
    return User.update(
      {_id: req.params.id},
      req.body,
      {upsert: true}
    )
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }

  // Delete handling
  if (req.method === 'DELETE') {
    if (!req.params.id) {
      return res.send(HTTP_STATUSES.BAD_REQUEST.createError('Id should be specified'));
    }
    return User.remove({_id: req.params.id})
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        log.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  }
};
