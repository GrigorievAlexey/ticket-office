'use strict';

module.exports = seed => ({
  name: `Name of ${seed} event`,
  description: `Description of ${seed} event`,
  date: new Date(Date.now() + (1 + seed % 10) * 1000 * 60 * 60 * 24).toISOString(),
  place: `Place of ${seed} event`,
});
