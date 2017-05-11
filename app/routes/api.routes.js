/**
 * Created by alex on 5/10/17.
 */
'use strict';


const requireAuthentication = require('app/lib/middleware/check-auth');
const userController = require('app/controllers/user.controller');
const eventController = require('app/controllers/event.controller');
const ticketController = require('app/controllers/ticket.controller');
const apiRouter = require('express').Router();

apiRouter.all('*', requireAuthentication);

apiRouter.all('/users/:id?', userController);
apiRouter.all('/events/:id?', eventController);
apiRouter.all(['/tickets/:id?', '/events/:eventId/tickets/:id?'], ticketController);

module.exports = apiRouter;
