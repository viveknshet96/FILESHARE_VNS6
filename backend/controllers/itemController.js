const Item = require('../models/Item');
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
exports.uploadFiles = async (req, res) => {
    const { parentId } = req.body;
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files uploaded.' });
        }

        const fileItems = req.files.map(file => ({
            name: file.originalname,
            type: 'file',
            parentId: parentId || null,
            fileName: file.filename,
            path: file.path,
            size: file.size,
            owner: req.user.id,
        }));

        const insertedFiles = await Item.insertMany(fileItems);
        res.status(201).json(insertedFiles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Generate a share code for an item (file or folder)
// Replace the old createShareLink function with this one

exports.createShareLink = async (req, res) => {
    // Expect an array of item IDs from the request body
    const { itemIds } = req.body;

    if (!itemIds || itemIds.length === 0) {
        return res.status(400).json({ msg: 'No items selected for sharing.' });
    }

    try {
        const code = generateCode();
        const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

        // Update all selected items to have the same share code and expiration date
        await Item.updateMany(
            { _id: { $in: itemIds } },
            { $set: { shareCode: code, shareExpiresAt: expiration } }
        );

        res.json({ code: code });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get shared item(s) by code
exports.getSharedItems = async (req, res) => {
    try {
        const item = await Item.findOne({
            shareCode: req.params.code.toUpperCase(),
            shareExpiresAt: { $gt: new Date() } // Check if not expired
        });

        if (!item) return res.status(404).json({ msg: 'Link is invalid or has expired.' });

        if (item.type === 'file') {
            return res.json([item]); // Return as an array for consistency
        }
        
        // If it's a folder, get its contents
        const folderContents = await Item.find({ parentId: item._id }).sort({ type: -1, name: 1 });
        res.json(folderContents);
    } catch (err) {
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