const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const upload = require('../middleware/upload');

// Public route for guest uploads, no auth needed
router.post('/upload', upload, guestController.uploadGuestFiles);

// @route   POST /api/guest/share
// @desc    Create a share link for guest files (no auth required)
router.post('/share', guestController.createGuestShareLink);

module.exports = router;