const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/attendance/scan:
 *   post:
 *     summary: Scan a ticket and record attendance
 *     tags: [Attendance]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketId]
 *             properties:
 *               ticketId: { type: integer }
 *     responses:
 *       201: { description: Attendance recorded }
 *       400: { description: Ticket invalid or already used }
 *       403: { description: Only organizer }
 */
router.post('/scan', protect, organizerOnly, attendanceController.scan);

module.exports = router;
