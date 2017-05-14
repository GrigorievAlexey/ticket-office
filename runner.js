'use strict';

// Usage example'node runner.js server`
require('app-module-path').addPath(__dirname);
const runParam = process.argv[2];
console.log(`Starting ${runParam}`)
require(runParam);
