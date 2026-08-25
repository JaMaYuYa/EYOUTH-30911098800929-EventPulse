const { body, param, mongoose } = require('express-validator');
const Category = require('../models/category.model.js');
const mongooseLib = require('mongoose');

// Helper to check valid MongoId string before database call
const isValidMongoId = (id) => mongooseLib.Types.ObjectId.isValid(id);

// 1. Param Validation
exports.mongoIdParamValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

// 2. Auth Validations
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// 3. Event Validations
exports.createEventValidation = [
  body().custom((value, { req }) => {
    const allowedFields = ['title', 'description', 'category', 'date', 'venue', 'city', 'capacity', 'ticketPrice', 'organizer', 'location'];
    const invalidKeys = Object.keys(req.body).filter((key) => !allowedFields.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid field(s) provided: ${invalidKeys.join(', ')}`);
    }
    return true;
  }),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Category must be a valid MongoId')
    .custom(async (categoryId) => {
      // Guard: skip DB check if not a valid ObjectId to prevent CastError
      if (!isValidMongoId(categoryId)) return true;

      const exists = await Category.exists({ _id: categoryId });
      if (!exists) {
        throw new Error('Category does not exist');
      }
    }),
  body('date').isISO8601().toDate().withMessage('Date must be a valid ISO8601 date'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

exports.updateEventValidation = [
  param('id').isMongoId().withMessage('Invalid event ID format'),
  body().custom((value, { req }) => {
    const allowedFields = ['title', 'description', 'category', 'date', 'venue', 'city', 'capacity', 'ticketPrice', 'organizer', 'location'];
    const keys = Object.keys(req.body);

    if (keys.length === 0) {
      throw new Error('Update payload cannot be empty');
    }

    const invalidKeys = keys.filter((key) => !allowedFields.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid field(s) provided: ${invalidKeys.join(', ')}`);
    }

    return true;
  }),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category')
    .optional()
    .isMongoId().withMessage('Category must be a valid MongoId')
    .custom(async (categoryId) => {
      if (!categoryId || !isValidMongoId(categoryId)) return true;

      const exists = await Category.exists({ _id: categoryId });
      if (!exists) {
        throw new Error('Category does not exist');
      }
    }),
  body('date').optional().isISO8601().toDate().withMessage('Date must be a valid ISO8601 date'),
  body('venue').optional().trim().notEmpty().withMessage('Venue cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

// 4. Feature Validations
exports.createRegistrationValidation = [
  body('eventId').isMongoId().withMessage('Event ID must be a valid MongoId'),
];

exports.createAnnouncementValidation = [
  body('eventId').isMongoId().withMessage('Event ID must be a valid MongoId'),
  body('text').trim().notEmpty().withMessage('Announcement text is required'),
];