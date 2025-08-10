const Item = require('../models/Item');
const User = require('../models/User');

const GUEST_USER_EMAIL = 'guest@vshare.com';

// This function finds the guest user's ID on server startup for efficiency
let guestUserId = null;
const getGuestUserId = async () => {
    if (guestUserId) return guestUserId;
    try {
        const guestUser = await User.findOne({ email: GUEST_USER_EMAIL });
        if (guestUser) guestUserId = guestUser._id;
        return guestUserId;
    } catch (error) {
        console.error('CRITICAL: Guest user not found in database.');
        return null;
    }
};
getGuestUserId();

// Logic for handling guest file uploads
exports.uploadGuestFiles = async (req, res) => {
    const ownerId = await getGuestUserId();
    if (!ownerId) {
        return res.status(500).send('Server configuration error.');
    }

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files uploaded.' });
        }
        
        const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

        const fileItems = req.files.map(file => ({
            name: file.originalname,
            type: 'file',
            owner: ownerId,
            fileName: file.filename,
            path: file.path,
            size: file.size,
            expiresAt: expirationDate, // Set the expiration date for auto-deletion
        }));

        const insertedFiles = await Item.insertMany(fileItems);
        res.status(201).json(insertedFiles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};