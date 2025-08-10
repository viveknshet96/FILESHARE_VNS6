const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
router.post('/login', authController.loginUser);

// @route   GET /api/auth
router.get('/', authMiddleware, authController.getLoggedInUser);

module.exports = router;