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

apiRouter.all([
  '/tickets/:id?',
  '/events/:eventId/tickets/:id?/:action?',
  '/users/:userId/tickets/:id?',
], ticketController);
apiRouter.all(['/users/:action?', '/users/:id?/:action?'], userController);
apiRouter.all('/events/:id?', eventController);

module.exports = apiRouter;
