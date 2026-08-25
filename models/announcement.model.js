const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Announcement must be linked to an event ID'],
    },
    text: {
      type: String,
      required: [true, 'Announcement text is required'],
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Announcement must have a sender'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);