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

// Fixed version of uploadGuestFiles function in guestController.js
exports.uploadGuestFiles = async (req, res) => {
    const { parentId } = req.body;
    const ownerId = await getGuestUserId();
    if (!ownerId) {
        return res.status(500).send('Server configuration error.');
    }

    console.log('=== GUEST UPLOAD DEBUG ===');
    console.log('Raw parentId:', parentId, typeof parentId);
    console.log('Owner ID:', ownerId);
    console.log('Files:', req.files?.map(f => f.originalname));

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files uploaded.' });
        }
        
        const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newFileItems = [];

        for (const file of req.files) {
            console.log('\n--- Processing guest file:', file.originalname, '---');
            
            let newName = file.originalname;
            let counter = 1;
            const nameParts = newName.lastIndexOf('.') > -1 ? {
                base: newName.substring(0, newName.lastIndexOf('.')),
                ext: newName.substring(newName.lastIndexOf('.'))
            } : { base: newName, ext: '' };

            // Properly handle parentId conversion
            let searchParentId;
            if (parentId === null || parentId === undefined || parentId === 'null' || parentId === '') {
                searchParentId = null;
            } else {
                searchParentId = parentId;
            }
            
            console.log('Converted parentId:', searchParentId, typeof searchParentId);

            // Create the search query
            const baseQuery = { 
                parentId: searchParentId, 
                owner: ownerId 
            };

            // Check if a file with the same name already exists for the guest user
            let existingItem = await Item.findOne({ ...baseQuery, name: newName });
            console.log('Initial check for', newName, '- found:', existingItem ? 'YES' : 'NO');
            
            while (existingItem) {
                console.log(`Name collision for "${newName}", trying counter ${counter}`);
                newName = `${nameParts.base} (${counter})${nameParts.ext}`;
                counter++;
                
                // Safety check
                if (counter > 100) {
                    throw new Error(`Unable to generate unique filename for ${file.originalname}`);
                }
                
                existingItem = await Item.findOne({ ...baseQuery, name: newName });
                console.log('Checking', newName, '- found:', existingItem ? 'YES' : 'NO');
            }
            
            console.log('Final filename:', newName);
            
            const newFileItem = {
                name: newName,
                type: 'file',
                parentId: searchParentId,
                owner: ownerId,
                fileName: file.filename,
                path: file.path,
                size: file.size,
                expiresAt: expirationDate,
            };
            
            console.log('Guest file item to insert:', newFileItem);
            newFileItems.push(newFileItem);
        }

        console.log('\n=== INSERTING GUEST FILES ===');
        console.log('Total files to insert:', newFileItems.length);

        // Insert files one by one to handle potential race conditions better
        const insertedFiles = [];
        for (const fileItem of newFileItems) {
            try {
                const inserted = await Item.create(fileItem);
                insertedFiles.push(inserted);
                console.log('Successfully inserted:', inserted.name);
            } catch (insertErr) {
                if (insertErr.code === 11000) {
                    console.error('Duplicate key error for:', fileItem.name, insertErr.keyValue);
                    // Try with a new counter if we hit a race condition
                    let retryCounter = 1;
                    let retryName = fileItem.name;
                    const parts = retryName.lastIndexOf('.') > -1 ? {
                        base: retryName.substring(0, retryName.lastIndexOf('.')),
                        ext: retryName.substring(retryName.lastIndexOf('.'))
                    } : { base: retryName, ext: '' };
                    
                    // Remove existing counter if present
                    const baseClean = parts.base.replace(/ \(\d+\)$/, '');
                    
                    while (retryCounter <= 10) {
                        retryName = `${baseClean} (${retryCounter})${parts.ext}`;
                        try {
                            const retryItem = { ...fileItem, name: retryName };
                            const inserted = await Item.create(retryItem);
                            insertedFiles.push(inserted);
                            console.log('Successfully inserted with retry name:', inserted.name);
                            break;
                        } catch (retryErr) {
                            if (retryErr.code === 11000) {
                                retryCounter++;
                                continue;
                            } else {
                                throw retryErr;
                            }
                        }
                    }
                    
                    if (retryCounter > 10) {
                        throw new Error(`Failed to insert file after 10 retries: ${fileItem.name}`);
                    }
                } else {
                    throw insertErr;
                }
            }
        }

        res.status(201).json(insertedFiles);
    } catch (err) {
        console.error('=== GUEST UPLOAD ERROR ===');
        console.error('Error:', err.message);
        if (err.code === 11000) {
            console.error('Duplicate key details:', err.keyValue);
        }
        res.status(500).json({ 
            msg: 'Server Error',
            error: err.message 
        });
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