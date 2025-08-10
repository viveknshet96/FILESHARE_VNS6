const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


const bcrypt = require('bcryptjs'); // Make sure bcryptjs is required at the top
const User = require('../models/User'); // Make sure User model is required at the top

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


// @route   POST /api/auth/register
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
router.post('/login', authController.loginUser);

// @route   GET /api/auth
router.get('/', authMiddleware, authController.getLoggedInUser);

module.exports = router;