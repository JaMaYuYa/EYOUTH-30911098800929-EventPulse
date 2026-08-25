const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createEventValidation, updateEventValidation, mongoIdParamValidation } = require('../middleware/validators');
const ctrl = require('../controllers/eventsController');

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: Fetch all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events retrieved successfully
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - venue
 *               - city
 *               - category
 *               - capacity
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tech Conference 2026
 *               description:
 *                 type: string
 *                 example: Annual tech community gathering
 *               date:
 *                 type: string
 *                 example: 2026-10-15T10:00:00.000Z
 *               venue:
 *                 type: string
 *                 example: Grand Hall Center
 *               city:
 *                 type: string
 *                 example: Cairo
 *               category:
 *                 type: string
 *                 description: Valid MongoDB ObjectId for category
 *                 example: 66b1234567890123456789ab
 *               capacity:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       201:
 *         description: Event created successfully
 *       422:
 *         description: Validation error or missing required fields
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/', ctrl.getEvents);
router.post('/', requireAuth, requireRole('admin'), createEventValidation, validate, ctrl.createEvent);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get event details by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event Mongo Object ID
 *     responses:
 *       200:
 *         description: Event details retrieved successfully
 *       404:
 *         description: Event not found
 *   patch:
 *     summary: Update event information
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event Mongo Object ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Event not found
 *       422:
 *         description: Validation error
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event Mongo Object ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Event not found
 */
router.get('/:id', mongoIdParamValidation, validate, ctrl.getEventById);
router.patch('/:id', requireAuth, requireRole('admin'), updateEventValidation, validate, ctrl.updateEvent);
router.delete('/:id', requireAuth, requireRole('admin'), mongoIdParamValidation, validate, ctrl.deleteEvent);

module.exports = router;