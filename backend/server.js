const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');
const itemRoutes = require('./routes/items'); // This is the corrected line
const guestRoutes = require('./routes/guest');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/items', itemRoutes); // This is the corrected line
app.use('/api/guest', guestRoutes);

// Function to get local network IP
const getLocalIpAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            const { address, family, internal } = iface;
            if (family === 'IPv4' && !internal) {
                return address;
            }
        }
    }
    return 'localhost';
};


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


const localIp = getLocalIpAddress();

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected...');
        app.listen(PORT, () => {
            console.log(`✅ Server is running!`);
            console.log(`   - Local:   http://localhost:${PORT}`);
            console.log(`   - Network: http://${localIp}:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

// Expose the local IP for QR code generation
app.set('localIp', localIp);