const Event = require('../models/event.model.js');
const Registration = require('../models/registration.model.js');
const Category = require('../models/category.model.js'); // Import existing model
require('../models/user.model.js');     // Prevents MissingSchemaError

const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/events - List events with filtering, search, pagination, & sorting
exports.getEvents = asyncHandler(async (req, res, next) => {
  const { category, city, startDate, endDate, page, limit, sortBy, order, search } = req.query;

  // 1. Filtering
  const filter = {};

  if (category) filter.category = category;
  if (city) filter.city = city;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // 2. Text Search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // 3. Pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  // 4. Safe Sorting Whitelist
  const allowedSortFields = ['date', 'registrations'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
  const sortDirection = order === 'desc' ? -1 : 1;

  let data;

  // 5. Query Execution
  if (sortField === 'registrations') {
    data = await Event.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'event',
          as: 'registrationList',
        },
      },
      {
        $addFields: {
          registrationCount: { $size: '$registrationList' },
        },
      },
      { $project: { registrationList: 0 } },
      { $sort: { registrationCount: sortDirection } },
      { $skip: skip },
      { $limit: limitNum },
    ]);

    // Populate category on aggregated results
    await Event.populate(data, { path: 'category' });
  } else {
    data = await Event.find(filter)
      .populate('category')
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum);
  }

  const total = await Event.countDocuments(filter);
  const totalPages = Math.ceil(total / limitNum);

  // 6. Response Shape
  res.status(200).json({
    status: 'success',
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    data,
  });
});

// GET /api/events/:id - Get single event
exports.getEventById = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('category')
    .populate('organizer');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: event,
  });
});

// POST /api/events - Create new event (Admin only)
exports.createEvent = asyncHandler(async (req, res, next) => {
  // 1. Check if category exists before saving
  if (req.body.category) {
    const categoryExists = await Category.exists({ _id: req.body.category });
    if (!categoryExists) {
      return next(new AppError('No category found with that ID', 404));
    }
  }

  // 2. Create the event
  const eventData = {
    ...req.body,
    organizer: req.body.organizer || (req.user ? req.user._id : undefined),
  };

  const newEvent = await Event.create(eventData);

  // 3. Return event with populated category
  const event = await Event.findById(newEvent._id).populate('category');

  res.status(201).json({
    status: 'success',
    data: event,
  });
});

// PATCH /api/events/:id - Update event (Admin only)
exports.updateEvent = asyncHandler(async (req, res, next) => {
  if (req.body.category) {
    const categoryExists = await Category.exists({ _id: req.body.category });
    if (!categoryExists) {
      return next(new AppError('No category found with that ID', 404));
    }
  }

  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: event,
  });
});

// DELETE /api/events/:id - Delete event (Admin only)
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  await Registration.deleteMany({ event: req.params.id });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});