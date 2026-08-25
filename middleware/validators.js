const { body, param } = require('express-validator');

exports.mongoIdParamValidation = [
  param('id').optional().isMongoId().withMessage('Invalid ID format'),
  param('eventId').optional().isMongoId().withMessage('Invalid Event ID format')
];

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.createEventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').isMongoId().withMessage('Category must be a valid MongoId'),
  body('date').isISO8601().toDate().withMessage('Date must be a valid ISO8601 date'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

exports.updateEventValidation = [
  param('id').isMongoId().withMessage('Invalid event ID format'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().isMongoId().withMessage('Category must be a valid MongoId'),
  body('date').optional().isISO8601().toDate().withMessage('Date must be a valid ISO8601 date'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
];

exports.createRegistrationValidation = [
  body('eventId').isMongoId().withMessage('Event ID must be a valid MongoId'),
];

exports.createAnnouncementValidation = [
  body('eventId').isMongoId().withMessage('Event ID must be a valid MongoId'),
  body('text').trim().notEmpty().withMessage('Announcement text is required'),
];