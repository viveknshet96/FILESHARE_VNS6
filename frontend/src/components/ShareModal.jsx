import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import Loader from './Loader';


const ShareModal = ({ code, onClose }) => {
    // State to hold the generated QR code image data
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    // Construct the full, shareable URL from the code
    const shareUrl = `${window.location.origin}/receive/${code}`;

    // Effect to generate the QR code whenever the component receives a new code
    useEffect(() => {
        if (code) {
            QRCode.toDataURL(shareUrl, { width: 256, margin: 1 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error('Failed to generate QR code:', err));
        }
    }, [code, shareUrl]);

    // Helper function to copy text to the user's clipboard
    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
    };

    // Don't render the modal if there's no code
    if (!code) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                <h2 className="modal-title">Share Your Files</h2>
                <p>Anyone with this code or link can access the shared items.</p>
                
                <div className="share-code-display" onClick={() => copyToClipboard(code, 'Code')}>
                    {code}
                    {/* ✅ ADD THIS SPAN */}
                    <span className="copy-hint-text">Click to Copy</span>
                </div>
                
                <div className="share-link-display" onClick={() => copyToClipboard(shareUrl, 'Link')}>
                    {shareUrl}
                </div>

                <div className="share-qr-display">
                    {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Share QR Code" />
                    ) : (
                        <Loader />
                    )}
                    <p>Scan QR Code</p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;