const qrcode = require('qrcode');
const os = require('os');

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

// Generate QR Code
exports.generateQR = async (req, res) => {
    try {
        const localIp = getLocalIpAddress();
        // The URL in the QR code will point to the frontend app's address on the local network
        const frontendUrl = process.env.FRONTEND_URL.replace('localhost', localIp);

        const qrCodeDataURL = await qrcode.toDataURL(frontendUrl);
        
        res.json({ qrCodeUrl: qrCodeDataURL, networkUrl: frontendUrl });
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).send('Server Error');
    }
};