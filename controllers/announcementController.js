const Event = require('../models/event.model');
const Announcement = require('../models/announcement.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose'); // <-- Added this missing import

// @desc    Create an announcement for an event
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res, next) => {
  try {
    // 1. Extract eventId safely (works whether passed in body OR in URL params)
    const eventId = req.body.eventId || req.params.eventId;
    const { text } = req.body;

    // 2. Validate required fields
    if (!eventId) {
      return res.status(400).json({
        status: 'fail',
        message: 'eventId is required in body or URL parameters',
      });
    }

    if (!text) {
      return res.status(400).json({
        status: 'fail',
        message: 'text is required',
      });
    }

    // 3. Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid Event ID format',
      });
    }

    // 4. Create document in MongoDB
    const announcement = await Announcement.create({
      eventId: new mongoose.Types.ObjectId(eventId),
      text,
      sender: req.user ? req.user._id || req.user.id : req.body.sender,
    });

    // 5. Populate sender info for real-time broadcast
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('sender', 'name email');

    // 6. Broadcast to Socket.IO room
    const io = req.app.get('io');
      if (io) {
      io.to(eventId.toString()).emit('announcement:created', populatedAnnouncement);
}

    res.status(201).json({
      status: 'success',
      data: populatedAnnouncement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all announcements for an event
// @route   GET /api/announcements/event/:eventId
exports.getAnnouncementsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // 1. Check if eventId is a valid Mongo ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Invalid Event ID format' 
      });
    }

    // 2. Fetch announcements from database sorted from oldest to newest
    const announcements = await Announcement.find({ 
      eventId: new mongoose.Types.ObjectId(eventId) 
    })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    // 3. Send response
    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ status: 'fail', message: 'Announcement not found' });
    }

    // Explicitly stringify the room ID
    const eventIdString = announcement.eventId.toString();

    // Delete from MongoDB
    await announcement.deleteOne();

    // Broadcast event to room
    const io = req.app.get('io');
    if (io) {
      // Must use .toString() to match the room string name
      io.to(eventIdString).emit('announcement:deleted', { id: id.toString() });
      console.log(`Emitted deletion for ${id} to room ${eventIdString}`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Announcement deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};