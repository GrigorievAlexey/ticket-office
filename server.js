'use strict';

let config = require('./config/config');
let httpPort = config.httpPort;
let httpsPort = config.httpsPort;

let fs = require('fs');
let http = require('http');
let https = require('https');
let privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

let credentials = {key: privateKey, cert: certificate};
let express = require('express');
let app = express();

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort, function () {
  console.log(`HTTP listening on ${httpPort}`)
});
httpsServer.listen(httpsPort, function () {
  console.log(`HTTPS listening on ${httpsPort}`)
});
