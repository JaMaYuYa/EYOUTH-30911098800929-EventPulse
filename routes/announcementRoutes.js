const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { getAnnouncementsByEvent } = require('../controllers/announcementController');

// Import validators safely
const validators = require('../middleware/validators');
const createAnnouncementValidation = validators.createAnnouncementValidation || [];
const mongoIdParamValidation = validators.mongoIdParamValidation || [];

// Import controller
const ctrl = require('../controllers/announcementController');

// 1. CREATE: POST /api/announcements
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'organizer'),
  createAnnouncementValidation,
  validate,
  ctrl.createAnnouncement
);

// 2. READ BY EVENT: GET /api/announcements/event/:eventId
router.get('/:eventId', getAnnouncementsByEvent);

// 3. DELETE: DELETE /api/announcements/:id
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'organizer'),
  mongoIdParamValidation,
  validate,
  ctrl.deleteAnnouncement
);

module.exports = router;