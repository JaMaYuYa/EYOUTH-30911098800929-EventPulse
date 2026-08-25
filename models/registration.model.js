const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Registration must be linked to an event'],
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Registration must be linked to an attendee user'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate registrations at database level
registrationSchema.index({ event: 1, attendee: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);