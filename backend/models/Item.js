const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['file', 'folder'],
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        default: null,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileName: {
        type: String,
    },
    path: {
        type: String,
    },
    size: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        index: { expires: 0 } 
    },
});

// ✅ FIX: The unique index now includes the 'owner', allowing different users
// to have items with the same name in the same folder structure.
ItemSchema.index({ parentId: 1, name: 1, owner: 1 }, { unique: true });

module.exports = mongoose.models.Item || mongoose.model('Item', ItemSchema);