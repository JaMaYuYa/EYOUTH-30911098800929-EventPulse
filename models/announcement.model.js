const mongoose = require('mongoose');

// models/Announcement.js
const announcementSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  text: String,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });


module.exports = mongoose.model('Announcement', announcementSchema);