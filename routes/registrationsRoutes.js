const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createRegistrationValidation, mongoIdParamValidation } = require('../middleware/validators');
const ctrl = require('../controllers/registrationsController');

// CREATE (Register for an event)
router.post('/', requireAuth, createRegistrationValidation, validate, ctrl.registerForEvent);

// READ (Get all registrations for current user)
router.get('/my-registrations', requireAuth, ctrl.getMyRegistrations);

// READ (Get all registrations for an event - Admin only)
router.get('/event/:id', requireAuth, requireRole('admin'), mongoIdParamValidation, validate, ctrl.getEventRegistrations);

// DELETE (Cancel registration)
router.delete('/:id', requireAuth, mongoIdParamValidation, validate, ctrl.cancelRegistration);

module.exports = router;