const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); // Import the validator
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// The temporary '/create-guest-user' route has been removed for security.

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', [
    // ✅ ADDED: Server-side validation rules
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], authController.registerUser);

// @route   POST /api/auth/login
// @desc    Log in a user
router.post('/login', [
    // ✅ ADDED: Server-side validation rules
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], authController.loginUser);

// @route   GET /api/auth
// @desc    Get data for the logged-in user
router.get('/', authMiddleware, authController.getLoggedInUser);

module.exports = router;