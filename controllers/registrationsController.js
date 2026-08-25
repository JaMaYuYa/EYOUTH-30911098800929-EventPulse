const Registration = require('../models/registration.model');
const Event = require('../models/event.model');

exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId, event } = req.body;
    // Fallback to support either eventId or event from request body
    const targetEventId = eventId || event; 
    const userId = req.user._id || req.user.id;

    // 1. Verify event exists
    const eventDoc = await Event.findById(targetEventId);
    if (!eventDoc) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }

    // 2. Check if user already registered
    const existingRegistration = await Registration.findOne({ 
      attendee: userId, 
      event: targetEventId 
    });
    if (existingRegistration) {
      return res.status(409).json({ 
        status: 'fail', 
        message: 'You are already registered for this event' 
      });
    }

    // 3. Create registration mapping the logged-in user to 'attendee'
    const registration = await Registration.create({
      attendee: userId,
      event: targetEventId,
    });

    res.status(201).json({
      status: 'success',
      message: 'Registered for event successfully',
      data: registration,
    });
  } catch (err) {
    // 4. Handle MongoDB duplicate key error (code 11000)
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'You are already registered for this event',
      });
    }
    next(err);
  }
};

exports.getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const registrations = await Registration.find({ attendee: userId }).populate('event');

    res.status(200).json({ status: 'success', data: registrations });
  } catch (err) {
    next(err);
  }
};

exports.getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ event: eventId }).populate('attendee', 'name email');

    res.status(200).json({ status: 'success', data: registrations });
  } catch (err) {
    next(err);
  }
};

exports.cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const registration = await Registration.findOneAndDelete({ _id: id, attendee: userId });
    if (!registration) {
      return res.status(404).json({ status: 'fail', message: 'Registration not found' });
    }

    res.status(200).json({ status: 'success', message: 'Registration cancelled' });
  } catch (err) {
    next(err);
  }
};