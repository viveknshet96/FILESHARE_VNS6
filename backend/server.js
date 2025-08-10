const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');

// ✅ FIX: Uncomment these lines to import your route files
const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth');
const guestRoutes = require('./routes/guest');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// All middleware is grouped together
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// All API routes are grouped together
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/guest', guestRoutes);

// --- Helper Functions ---
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

const localIp = getLocalIpAddress();
app.set('localIp', localIp); 

// --- Database Connection & Server Start ---
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