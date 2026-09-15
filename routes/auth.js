const express = require('express');
const router = express.Router();
const { register, login, googleSSO } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validation');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/sso', googleSSO);

module.exports = router;