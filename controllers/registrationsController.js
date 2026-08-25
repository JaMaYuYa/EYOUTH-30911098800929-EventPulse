const Registration = require('../models/registration.model.js');
const Event = require('../models/event.model.js');
const AppError = require('../utils/AppError.js');
const asyncHandler = require('../utils/asyncHandler.js');

// POST /api/registrations - Register user for an event
exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const { eventId, event } = req.body;
  const targetEventId = eventId || event;
  const userId = req.user._id || req.user.id;

  // 1. Verify event exists
  const eventDoc = await Event.findById(targetEventId);
  if (!eventDoc) {
    return next(new AppError('Event not found', 404));
  }

  // 2. Check Event Capacity
  const currentRegistrationCount = await Registration.countDocuments({ event: targetEventId });
  if (eventDoc.capacity && currentRegistrationCount >= eventDoc.capacity) {
    return next(new AppError('Event has reached maximum capacity', 400));
  }

  // 3. Check if user is already registered
  const existingRegistration = await Registration.findOne({
    attendee: userId,
    event: targetEventId,
  });
  if (existingRegistration) {
    return next(new AppError('You are already registered for this event', 409));
  }

  // 4. Create registration record
  const registration = await Registration.create({
    attendee: userId,
    event: targetEventId,
  });

  // 5. Sync Event Model registrations array if present
  if (Array.isArray(eventDoc.registrations)) {
    eventDoc.registrations.push(registration._id);
    await eventDoc.save({ validateBeforeSave: false });
  }

  // 6. Real-time Socket.io Notification
  const io = req.app.get('io');
  if (io) {
    io.to(targetEventId.toString()).emit('new-registration', {
      message: 'A new user registered for this event',
      eventId: targetEventId,
      totalRegistrations: currentRegistrationCount + 1,
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'Registered for event successfully',
    data: registration,
  });
});

// GET /api/registrations/my-registrations - Get current user registrations
exports.getMyRegistrations = asyncHandler(async (req, res, next) => {
  const userId = req.user._id || req.user.id;
  const registrations = await Registration.find({ attendee: userId }).populate({
    path: 'event',
    populate: { path: 'category' },
  });

  res.status(200).json({
    status: 'success',
    results: registrations.length,
    data: registrations,
  });
});

// GET /api/registrations/event/:eventId - Get event attendee registrations (Admin/Organizer)
exports.getEventRegistrations = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const eventDoc = await Event.findById(eventId);
  if (!eventDoc) {
    return next(new AppError('Event not found', 404));
  }

  const registrations = await Registration.find({ event: eventId }).populate(
    'attendee',
    'name email'
  );

  res.status(200).json({
    status: 'success',
    results: registrations.length,
    data: registrations,
  });
});

// DELETE /api/registrations/:id - Cancel registration
exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id || req.user.id;

  const registration = await Registration.findOneAndDelete({ _id: id, attendee: userId });
  if (!registration) {
    return next(new AppError('Registration not found or unauthorized', 404));
  }

  // Sync Event Model on Cancel (Remove registration reference from array if present)
  if (registration.event) {
    await Event.findByIdAndUpdate(registration.event, {
      $pull: { registrations: registration._id },
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Registration cancelled successfully',
  });
});