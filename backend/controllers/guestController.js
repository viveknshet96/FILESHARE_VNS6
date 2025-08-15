const Item = require('../models/Item');
const User = require('../models/User');
const Share = require('../models/Share');
const fs = require('fs'); // ✅ Added missing import
const path = require('path'); // ✅ Added missing import
const archiver = require('archiver'); // ✅ Added missing import
const { customAlphabet } = require('nanoid');

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
const GUEST_USER_EMAIL = 'guest@vshare.com';

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

// --- Guest File Explorer Functions ---

exports.getGuestItems = async (req, res) => {
    try {
        const parentId = req.query.parentId || null;
        const ownerId = await getGuestUserId();
        if (!ownerId) return res.status(500).send('Server configuration error.');
        const items = await Item.find({ parentId: parentId, owner: ownerId }).sort({ type: -1, name: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.createGuestFolder = async (req, res) => {
    const { name, parentId } = req.body;
    const ownerId = await getGuestUserId();
    if (!ownerId) return res.status(500).send('Server configuration error.');
    try {
        const newFolder = new Item({
            name,
            type: 'folder',
            parentId: parentId || null,
            owner: ownerId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await newFolder.save();
        res.status(201).json(newFolder);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'A folder with this name already exists here.' });
        }
        res.status(500).send('Server Error');
    }
};
// In backend/controllers/guestController.js

exports.uploadGuestFiles = async (req, res) => {
    const { parentId } = req.body;
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

        for (const file of req.files) {
            let newName = file.originalname;
            let counter = 1;
            const nameParts = newName.lastIndexOf('.') > -1 ? {
                base: newName.substring(0, newName.lastIndexOf('.')),
                ext: newName.substring(newName.lastIndexOf('.'))
            } : { base: newName, ext: '' };

            // Check if a file with the same name already exists for the guest user
            while (await Item.findOne({ name: newName, parentId: parentId || null, owner: ownerId })) {
                newName = `${nameParts.base} (${counter})${nameParts.ext}`;
                counter++;
            }
            
            newFileItems.push({
                name: newName,
                type: 'file',
                parentId: parentId || null,
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
// --- Guest Sharing & Receiving Functions ---

exports.createGuestShareLink = async (req, res) => {
    const { itemIds } = req.body;
    if (!itemIds || itemIds.length === 0) return res.status(400).json({ msg: 'No items selected.' });

    try {
        const ownerId = await getGuestUserId();
        if (!ownerId) return res.status(500).send('Server configuration error.');

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
        res.status(500).send('Server Error');
    }
};

exports.receiveFiles = async (req, res) => {
    try {
        const { shareCode } = req.params;
        const share = await Share.findOne({ code: shareCode.toUpperCase() }).populate('items');
        if (!share) return res.status(404).json({ msg: 'Invalid or expired share code.' });
        res.json(share.items);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.downloadSharedFolderAsZip = async (req, res) => {
    try {
        const { code, folderId } = req.params;

        const share = await Share.findOne({ code: code.toUpperCase() });
        if (!share) return res.status(404).json({ msg: 'Share link invalid or expired.' });

        const isFolderInShare = share.items.some(id => id.toString() === folderId);
        const rootFolder = await Item.findById(folderId);
        if (!isFolderInShare || !rootFolder || rootFolder.type !== 'folder') {
            return res.status(404).json({ msg: 'Folder not found in this share.' });
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${rootFolder.name}.zip"`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        async function addFilesToZip(folderId, currentPath) {
            const children = await Item.find({ parentId: folderId });
            for (const child of children) {
                if (child.type === 'file') {
                    const filePath = path.join(__dirname, '../', child.path);
                    if (fs.existsSync(filePath)) {
                        archive.file(filePath, { name: path.join(currentPath, child.name) });
                    }
                } else if (child.type === 'folder') {
                    await addFilesToZip(child._id, path.join(currentPath, child.name));
                }
            }
        }

        await addFilesToZip(rootFolder._id, '');
        archive.finalize();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error: Could not create zip file.');
    }
};