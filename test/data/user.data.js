'use strict';

module.exports = seed => ({
  username: `email${seed}@site.com`,
  password: `password${seed}`,
  phoneNumber: `+${new Array(4).join(seed).slice(0, 11)}`,
});
