'use strict';

require('app-module-path').addPath(__dirname);

const fs = require('fs');
const log = require('config/log')(module);
const http = require('http');
const https = require('https');
const { httpPort, httpsPort, hostName } = require('config/env');
const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
};

const app = require('config/express')();

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort, () => {
  log.info(`HTTP listening on http://${hostName}:${httpPort}`)
});

httpsServer.listen(httpsPort, () => {
  log.info(`HTTPS listening on https://${hostName}:${httpsPort}`)
});
