import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import Loader from './Loader';

const ShareModal = ({ code, onClose }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    // Construct the full URL that the receiver will use
    const shareUrl = `${window.location.origin}/receive/${code}`;

    // Generate the QR code whenever the 'shareUrl' changes
    useEffect(() => {
        if (shareUrl) {
            QRCode.toDataURL(shareUrl, { width: 256 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error(err));
        }
    }, [shareUrl]);

    // Function to copy text to the clipboard and show a notification
    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} copied to clipboard!`);
    };

    if (!code) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>Share this Item</h2>
                <p>Anyone with this code or link can view the contents.</p>
                
                <div className="share-code-display" onClick={() => copyToClipboard(code, 'Code')}>
                    {code}
                    <span>Click to Copy Code</span>
                </div>
                
                <div className="share-link-display" onClick={() => copyToClipboard(shareUrl, 'Link')}>
                    {shareUrl}
                    <span>Click to Copy Link</span>
                </div>

                <div className="share-qr-display">
                    {qrCodeUrl ? <img src={qrCodeUrl} alt="Share QR Code" /> : <Loader />}
                    <p>Scan QR Code</p>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;