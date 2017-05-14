/**
 * Created by vedi on 08/07/16.
 */

'use strict';

const config = require('config/env');

require('config/mongoose');

const Mocha = require('mocha');


const mocha = new Mocha({
  ui: 'bdd',
  fullTrace: true,
});

mocha.addFile('test/spec/user-auth.spec.js');
mocha.addFile('test/spec/user.spec.js');
mocha.addFile('test/spec/event.spec.js');
mocha.addFile('test/spec/ticket.spec.js');

// Run the tests.
mocha.run((failures) => {
  process.exit(failures);
});
