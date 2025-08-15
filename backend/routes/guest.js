const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const upload = require('../middleware/upload');

// Public route for guest uploads, no auth needed
router.post('/upload', upload, guestController.uploadGuestFiles);

// NEW: Route to get guest items
router.get('/', guestController.getGuestItems);

// NEW: Route to create a guest folder
router.post('/folder', guestController.createGuestFolder);

// @route   POST /api/guest/share
// @desc    Create a share link for guest files (no auth required)
router.post('/share', guestController.createGuestShareLink);

router.get('/share/:code/download/folder/:folderId', guestController.downloadSharedFolderAsZip);

module.exports = router;
