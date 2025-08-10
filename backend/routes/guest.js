const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const upload = require('../middleware/upload');

// Public route for guest uploads, no auth needed
router.post('/upload', upload, guestController.uploadGuestFiles);

module.exports = router;