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
// Replace the existing uploadFiles function in itemController.js

// Replace the existing uploadFiles function with this debug version
// Fixed version of uploadFiles function in itemController.js
exports.uploadFiles = async (req, res) => {
    const { parentId } = req.body;
    
    console.log('=== REGULAR UPLOAD DEBUG ===');
    console.log('Raw parentId:', parentId, typeof parentId);
    console.log('User ID:', req.user.id);
    console.log('Files:', req.files?.map(f => f.originalname));
    
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: 'No files uploaded.' });
        }

        const newFileItems = [];
        for (const file of req.files) {
            console.log('\n--- Processing file:', file.originalname, '---');
            
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
                owner: req.user.id 
            };

            // Check if a file with the same name already exists
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
                fileName: file.filename,
                path: file.path,
                size: file.size,
                owner: req.user.id,
            };
            
            console.log('File item to insert:', newFileItem);
            newFileItems.push(newFileItem);
        }

        console.log('\n=== INSERTING FILES ===');
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
        console.error('=== UPLOAD ERROR ===');
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