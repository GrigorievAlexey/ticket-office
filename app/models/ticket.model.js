/**
 * Created by alex on 5/10/17.
 */

'use strict';

const modelName = 'Ticket';
const TICKET_STATUSES = require('config/globals').TICKET_STATUSES;

module.exports = function (mongoose) {
  let Schema = new mongoose.Schema({
    status: {
      type: Number,
      default: TICKET_STATUSES.AVAILABLE,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      allowNull: true,
    }
  });

  Schema.post('save', function (ticket) {
    return mongoose.model('Event')
      .findByIdAndUpdate(ticket.event, {$addToSet: {'tickets': ticket._id}}, {'new': true})
      .exec()
      .catch((err) => {
        console.err(err);
      });
  });

  Schema.pre('remove', function (ticket) {
    return mongoose.model('Event')
      .findByIdAndUpdate(ticket.event, {$pull: {'tickets': ticket._id}})
      .exec()
      .catch((err) => {
        console.err(err);
      });
  });

  Schema.statics.TICKET_STATUSES = TICKET_STATUSES;

  return mongoose.model(modelName, Schema);
};
