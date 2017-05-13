/**
 * Created by alex on 5/10/17.
 */
'use strict';

const userController = require('app/controllers/user.controller');
const eventController = require('app/controllers/event.controller');
const ticketController = require('app/controllers/ticket.controller');
const apiRouter = require('express').Router();
const passport = require('config/passport');

apiRouter.all('*', passport.authenticate('jwt', { session: false }));

ticketController(apiRouter);
userController(apiRouter);
eventController(apiRouter);

module.exports = apiRouter;
