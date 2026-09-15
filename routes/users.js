const express = require('express');
const router = express.Router();
const { getMe, updateMe } = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');

// GET /api/users/me (protected)
router.get('/me', authenticate, getMe);

// PUT /api/users/me (protected)
router.put('/me', authenticate, updateMe);

module.exports = router;