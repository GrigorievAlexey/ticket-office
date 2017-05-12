/**
 * Created by alex on 5/11/17.
 */

"use strict";

const db = require('config/mongoose');
const User = db.model('User');
const jwt = require('jsonwebtoken');
const config = require('config/env');
const HTTP_STATUSES = require('http-statuses');

module.exports = (app) => {
  app.post('/signup', (req, res) => {
    if (!req.body.username || !req.body.password) {
      return res.status(HTTP_STATUSES.BAD_REQUEST.code).send({message: 'User name and password should be specified'});
    }

    let newUser = new User(req.body);

    return newUser.save()
      .then(() => {
        return res.send({message: 'User has been created'});
      })
      .catch((err) => {
        return res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
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
          let token = jwt.sign(payload, config.secret);
          res.send({message: "ok", token: token});
        } else {
          res.status(HTTP_STATUSES.BAD_REQUEST.code).json({message:"Wrong password"});
        }
      })
      .catch((err) => {
        return res.status(err.httpStatus && err.httpStatus.code || 500).send(err.message);
      });
  });
};
