const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/sync/events:
 *   get:
 *     summary: Get events updated since lastSync
 *     tags: [Sync]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: lastSync
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Delta of events }
 */
router.get('/events', protect, syncController.events);

/**
 * @openapi
 * /api/sync/tickets:
 *   get:
 *     summary: Get the user's tickets updated since lastSync
 *     tags: [Sync]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: lastSync
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Delta of tickets }
 */
router.get('/tickets', protect, syncController.tickets);

/**
 * @openapi
 * /api/sync/offline:
 *   post:
 *     summary: Push offline actions to be replayed
 *     tags: [Sync]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actions:
 *                 type: array
 *                 items: { type: object }
 *     responses:
 *       200: { description: Sync result }
 */
router.post('/offline', protect, syncController.offline);

module.exports = router;
