const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/tickets/me:
 *   get:
 *     summary: List the authenticated user's tickets
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of tickets }
 */
router.get('/me', protect, ticketController.getMine);

/**
 * @openapi
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Ticket }
 *       404: { description: Not found }
 */
router.get('/:id', protect, ticketController.getOne);

/**
 * @openapi
 * /api/tickets/{id}/qr:
 *   get:
 *     summary: Generate a QR code image (data URL) for a ticket
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: QR data URL }
 */
router.get('/:id/qr', protect, ticketController.getQr);

/**
 * @openapi
 * /api/tickets/{id}/cancel:
 *   post:
 *     summary: Cancel a ticket
 *     tags: [Tickets]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Cancelled ticket }
 */
router.post('/:id/cancel', protect, ticketController.cancel);

module.exports = router;
