const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Message must be linked to an event ID'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);