const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: { // The display name, e.g., "My Report.pdf" or "Vacation Photos"
        type: String,
        required: true,
    },
    type: { // Differentiates between files and folders
        type: String,
        enum: ['file', 'folder'],
        required: true,
    },
    parentId: { // The ID of the parent folder. `null` means it's in the root directory.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        default: null,
    },
    
    // --- Fields specific to files ---
    fileName: { // The unique name stored on the server's disk
        type: String,
    },
    path: { // The server path to the file
        type: String,
    },
    size: {
        type: Number,
    },owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        index: { expires: '24h' }
    },
});

// Ensures that items within the same folder have unique names
ItemSchema.index({ parentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Item || mongoose.model('Item', ItemSchema);