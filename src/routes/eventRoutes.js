const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const ticketController = require('../controllers/ticketController');
const waitlistController = require('../controllers/waitlistController');
const attendanceController = require('../controllers/attendanceController');
const feedbackController = require('../controllers/feedbackController');
const reportController = require('../controllers/reportController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: List all events (supports filtering)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of events }
 *   post:
 *     summary: Create a new event (organizer only)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EventRequest' }
 *     responses:
 *       201: { description: Event created }
 *       403: { description: Organizer access required }
 */
router.get('/', eventController.list);
router.post('/', protect, organizerOnly, eventController.create);

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Event }
 *       404: { description: Not found }
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EventRequest' }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.get('/:id', eventController.getOne);
router.put('/:id', protect, organizerOnly, eventController.update);
router.delete('/:id', protect, organizerOnly, eventController.remove);

/**
 * @openapi
 * /api/events/{id}/tickets:
 *   post:
 *     summary: Register the authenticated user for an event
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201: { description: Ticket created }
 *       409: { description: Already registered or event full }
 */
router.post('/:id/tickets', protect, ticketController.registerForEvent);

/**
 * @openapi
 * /api/events/{id}/waitlist:
 *   post:
 *     summary: Join the waitlist for a full event
 *     tags: [Waitlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201: { description: Added to waitlist }
 */
router.post('/:id/waitlist', protect, waitlistController.join);

/**
 * @openapi
 * /api/events/{id}/waitlist/status:
 *   get:
 *     summary: Check the user's waitlist status for an event
 *     tags: [Waitlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Status }
 */
router.get('/:id/waitlist/status', protect, waitlistController.status);

/**
 * @openapi
 * /api/events/{id}/waitlist:
 *   get:
 *     summary: List the waitlist (organizer only)
 *     tags: [Waitlist]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Waitlist entries }
 */
router.get('/:id/waitlist', protect, organizerOnly, waitlistController.list);

/**
 * @openapi
 * /api/events/{id}/attendance:
 *   get:
 *     summary: List attendance records for an event (organizer only)
 *     tags: [Attendance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Attendance records }
 */
router.get('/:id/attendance', protect, attendanceController.list);

/**
 * @openapi
 * /api/events/{id}/attendance/stats:
 *   get:
 *     summary: Get attendance statistics for an event (organizer only)
 *     tags: [Attendance]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Stats }
 */
router.get('/:id/attendance/stats', protect, attendanceController.stats);

/**
 * @openapi
 * /api/events/{id}/feedback:
 *   post:
 *     summary: Submit feedback for an event
 *     tags: [Feedback]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *               anonymous: { type: boolean }
 *     responses:
 *       201: { description: Feedback created }
 *   get:
 *     summary: List all feedback for an event (organizer only)
 *     tags: [Feedback]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Feedback list + stats }
 */
router.post('/:id/feedback', protect, feedbackController.submit);
router.get('/:id/feedback', protect, organizerOnly, feedbackController.list);

/**
 * @openapi
 * /api/events/{id}/report:
 *   get:
 *     summary: Generate a CSV attendance report (organizer only)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, json] }
 *     responses:
 *       200: { description: CSV or JSON report }
 */
router.get('/:id/report', protect, organizerOnly, reportController.generate);

/**
 * @openapi
 * /api/events/{id}/report/export:
 *   get:
 *     summary: Export report metadata (organizer only)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Report payload }
 */
router.get('/:id/report/export', protect, organizerOnly, reportController.exportReport);

module.exports = router;
