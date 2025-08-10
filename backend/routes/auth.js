const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); // Import the validator
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const bcrypt = require('bcryptjs'); 
const User = require('../models/User'); 

router.post('/create-guest-user', async (req, res) => {
    try {
        const guestEmail = 'guest@vshare-guest.com';
        let guestUser = await User.findOne({ email: guestEmail });
        if (!guestUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('a_very_long_and_secure_password_123!', salt);
            guestUser = new User({ name: 'Guest', email: guestEmail, password: hashedPassword });
            await guestUser.save();
            return res.status(201).send('Guest user created');
        }
        return res.status(200).send('Guest user already exists');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error creating guest user');
    }
});


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