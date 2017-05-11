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

apiRouter.all('/users/:id?', userController);
apiRouter.all('/events/:id?', eventController);
apiRouter.all(['/tickets/:id?', '/events/:eventId/tickets/:id?/:action?'], ticketController);

module.exports = apiRouter;
