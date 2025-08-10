const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        // Automatically delete this share document after 24 hours
        index: { expires: '24h' } 
    }
});

module.exports = mongoose.models.Share || mongoose.model('Share', ShareSchema);