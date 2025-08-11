const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Each email must be unique
    },
    password: {
        type: String,
        required: true,
    },
    registerDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);