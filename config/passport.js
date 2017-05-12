/**
 * Created by alex on 5/11/17.
 */

'use strict';

const db =  require('config/mongoose');
const User = db.model('User');
const config = require('config/env');
const passport = require('passport');
const log = require('config/log')(module);

const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

let options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeader();
options.secretOrKey = config.secret;

passport.use(new JwtStrategy(options, (jwt_payload, done) => {
  return User.findOne({_id: jwt_payload.id}, {hashedPassword: false, salt: false})
    .lean()
    .then((user) => {
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    })
    .catch((err) => {
      return done(err);
    });
}));

module.exports = passport;
