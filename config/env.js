'use strict';

module.exports = {
  httpPort: process.env.HTTP_PORT || '8080',
  httpsPort: process.env.HTTPS_PORT || '8443',
  hostName: process.env.HOST_NAME || 'localhost',
  mongo: process.env.MONGO_URL || 'mongodb://localhost/ticket-office',
};
