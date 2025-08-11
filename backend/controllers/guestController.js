const Item = require('../models/Item');
const User = require('../models/User');
const Share = require('../models/Share');
// ✅ FIX: Add the missing import for nanoid
const { customAlphabet } = require('nanoid');

// ✅ FIX: Define the generateCode function
const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

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
// Replace the existing uploadGuestFiles function in guestController.js with this one

exports.uploadGuestFiles = async (req, res) => {
    const ownerId = await getGuestUserId();
    if (!ownerId) {
        return res.status(500).send('Server configuration error.');
    }

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files uploaded.' });
        }
        
        const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newFileItems = [];

        // ✅ FIX: Added intelligent renaming logic for guest uploads
        for (const file of req.files) {
            let newName = file.originalname;
            let counter = 1;
            const nameParts = newName.lastIndexOf('.') > -1 ? {
                base: newName.substring(0, newName.lastIndexOf('.')),
                ext: newName.substring(newName.lastIndexOf('.'))
            } : { base: newName, ext: '' };

            // Check if a file with the same name already exists for the guest user
            while (await Item.findOne({ name: newName, parentId: null, owner: ownerId })) {
                newName = `${nameParts.base} (${counter})${nameParts.ext}`;
                counter++;
            }
            
            newFileItems.push({
                name: newName,
                type: 'file',
                owner: ownerId,
                fileName: file.filename,
                path: file.path,
                size: file.size,
                expiresAt: expirationDate,
            });
        }

        const insertedFiles = await Item.insertMany(newFileItems);
        res.status(201).json(insertedFiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// Creates a share link for items belonging to the Guest user
exports.createGuestShareLink = async (req, res) => {
    const { itemIds } = req.body;
    if (!itemIds || itemIds.length === 0) {
        return res.status(400).json({ msg: 'No items selected for sharing.' });
    }

    try {
        const ownerId = await getGuestUserId();
        if (!ownerId) {
            return res.status(500).send('Server configuration error.');
        }

        // Security Check: Verify all items belong to the Guest user
        const items = await Item.find({ _id: { $in: itemIds }, owner: ownerId });
        if (items.length !== itemIds.length) {
            return res.status(403).json({ msg: 'Forbidden: Attempted to share unauthorized files.' });
        }

        const newShare = new Share({
            code: generateCode(),
            items: itemIds,
        });
        await newShare.save();
        res.json({ code: newShare.code });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};