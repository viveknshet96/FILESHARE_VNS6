const Item = require('../models/Item');
const Share = require('../models/Share');
const fs = require('fs');
const path = require('path');
const { customAlphabet } = require('nanoid');

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

// Get all items within a specific folder
exports.getItems = async (req, res) => {
    try {
        const parentId = req.query.parentId || null;
        const items = await Item.find({ parentId: parentId, owner: req.user.id }).sort({ type: -1, name: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Create a new folder
exports.createFolder = async (req, res) => {
    const { name, parentId } = req.body;
    try {
        const newFolder = new Item({
            name,
            type: 'folder',
            parentId: parentId || null,
            owner: req.user.id,
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

// Upload files into a specific folder
// Replace the existing uploadFiles function in itemController.js with this one

exports.uploadFiles = async (req, res) => {
    const { parentId } = req.body;
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files uploaded.' });
        }

        const newFileItems = [];
        for (const file of req.files) {
            let newName = file.originalname;
            let counter = 1;
            const nameParts = newName.lastIndexOf('.') > -1 ? {
                base: newName.substring(0, newName.lastIndexOf('.')),
                ext: newName.substring(newName.lastIndexOf('.'))
            } : { base: newName, ext: '' };

            // Check if a file with the same name already exists in this folder for this user
            while (await Item.findOne({ name: newName, parentId: parentId || null, owner: req.user.id })) {
                // If it exists, append a number and check again
                newName = `${nameParts.base} (${counter})${nameParts.ext}`;
                counter++;
            }
            
            newFileItems.push({
                name: newName,
                type: 'file',
                parentId: parentId || null,
                fileName: file.filename,
                path: file.path,
                size: file.size,
                owner: req.user.id,
            });
        }

        const insertedFiles = await Item.insertMany(newFileItems);
        res.status(201).json(insertedFiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// UPDATED: Creates a single 'Share' document for multiple items
exports.createShareLink = async (req, res) => {
    const { itemIds } = req.body;
    if (!itemIds || itemIds.length === 0) {
        return res.status(400).json({ msg: 'No items selected.' });
    }
    try {
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



// UPDATED: Gets shared items by finding the 'Share' document first
exports.getSharedItems = async (req, res) => {
    try {
        const share = await Share.findOne({ code: req.params.code.toUpperCase() })
            .populate('items'); // Fetches all the associated item data

        if (!share) {
            return res.status(404).json({ msg: 'Link is invalid or has expired.' });
        }
        res.json(share.items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add this new function to backend/controllers/itemController.js
// --- Helper function for finding all items to delete from the DB ---
async function findItemsToDelete(itemId) {
    const itemsToDelete = [itemId];
    const children = await Item.find({ parentId: itemId });

    for (const child of children) {
        if (child.type === 'folder') {
            const subFolderItems = await findItemsToDelete(child._id);
            itemsToDelete.push(...subFolderItems);
        } else {
            itemsToDelete.push(child._id);
        }
    }
    return itemsToDelete;
}
// --- UPDATED DELETE FUNCTION ---
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: 'Item not found.' });
        }

        let itemsToDeleteFromDB = [];

        if (item.type === 'folder') {
            // If it's a folder, find all nested items to delete their DB records
            itemsToDeleteFromDB = await findItemsToDelete(item._id);
        } else {
            // If it's just a single file
            itemsToDeleteFromDB = [item._id];
        }

        // We no longer delete the physical files from storage.
        // The `fs.unlink` code has been removed.

        // Delete all item records from the database in one go
        await Item.deleteMany({ _id: { $in: itemsToDeleteFromDB } });

        res.json({ msg: 'Item(s) removed successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};