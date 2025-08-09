import React from 'react';
import Loader from './Loader';

const QRCodeModal = ({ qrCodeUrl, networkUrl, isLoading, onClose }) => {
    if (!qrCodeUrl && !isLoading) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>Scan to Share on Your Network</h2>
                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        <img src={qrCodeUrl} alt="QR Code" />
                        <p>
                            Or open this URL on another device: <code>{networkUrl}</code>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default QRCodeModal;