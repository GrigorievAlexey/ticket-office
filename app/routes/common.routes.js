/**
 * Created by alex on 5/11/17.
 */

"use strict";

const _ = require('lodash');
const db = require('config/mongoose');
const User = db.model('User');
const jwt = require('jsonwebtoken');
const config = require('config/env');
const HTTP_STATUSES = require('http-statuses');
const twilio = require('app/lib/services/twilio.service');


module.exports = (app) => {
  app.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
      return res.status(HTTP_STATUSES.BAD_REQUEST.code).send({message: 'User name and password should be specified'});
    }
    console.log(req.path, req.params, req.body);
    let newUser = new User(req.body);

    return newUser.save()
      .then((result) => {
        let savedUser = _.pick(result, ['_id', 'username', 'createdAt', 'phoneNumber']);
        return res.status(HTTP_STATUSES.CREATED.code).send(savedUser);
      })
      .catch((err) => {
        console.error(err);
        return res.status(err.httpStatus && err.httpStatus.code || 500).send(err);
      });
  });

  app.post('/login', (req, res) => {
    if (!req.body.username || !req.body.password) {
      return res.status(HTTP_STATUSES.BAD_REQUEST.code).send({message: 'User name and password should be specified'});
    }

    User.findOne({username: req.body.username})
      .then((user) => {
        if (!user) {
          throw HTTP_STATUSES.NOT_FOUND.createError("No such user found");
        }

        if (user.authenticate(req.body.password)) {
          let payload = {id: user._id};
          let token = jwt.sign(payload, config.secret, {expiresIn: '1h'});
          res.send({message: "ok", token: token});
        } else {
          res.status(HTTP_STATUSES.BAD_REQUEST.code).json({message:"Wrong password"});
        }
      })
      .catch((err) => {
        return res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  });

  // Forgot password endpoint
  app.post('/forgot', (req, res) => {

    if (!req.body.username) {
      return res.status(HTTP_STATUSES.BAD_REQUEST.code).send('Username should be specified');
    }
    return User.findOne({ username: req.body.username })
      .then((user) => {
        if (!user) {
          throw HTTP_STATUSES.BAD_REQUEST.createError({ message: 'No user with such username' });
        }
        user.verificationCode = Math.random().toString(10).substr(2, 6);
        return user.save();
      })
      .then((user) => {
        return twilio.sendSmsTo(user.phoneNumber, `Verification code: ${user.verificationCode}`);
      })
      .then(() => {
        return res.status(HTTP_STATUSES.NO_CONTENT.code).send({ message: 'Verification code was sent' });
      })
      .catch((err) => {
        console.error(err);
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  });

  // Restore password endpoint
  app.post('/reset', (req, res) => {
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
        res.status(HTTP_STATUSES.NO_CONTENT.code).send({message: 'Password successfully changed'})
      })
      .catch((err) => {
        res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  });
};
