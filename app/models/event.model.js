/**
 * Created by alex on 5/10/17.
 */

'use strict';

let modelName = 'Event';

module.exports = function (mongoose) {
  let Schema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now() + 3 * 24 * 60 * 60 * 1000,
    },
    price: {
      type: Number,
      default: 5,
    },
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
      }
    ]
  });

  return mongoose.model(modelName, Schema);
};
