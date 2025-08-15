import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { getSharedItems, deleteItem } from '../api';
import ItemList from '../components/ItemList';
import Loader from '../components/Loader';

const ReceivePage = () => {
    const { state } = useContext(AuthContext);
    const { isAuthenticated } = state;

    const [code, setCode] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false); // State for scanner modal

    const { shareCode } = useParams();
    const navigate = useNavigate();

    // This effect handles the QR scanner logic
    useEffect(() => {
        // Ensure the library is loaded before trying to use it
        if (isScannerOpen && window.Html5Qrcode) {
            const qrScanner = new Html5Qrcode("qr-reader");

            const onScanSuccess = (decodedText, decodedResult) => {
                try {
                    // Extract the code from the full URL
                    const url = new URL(decodedText);
                    const pathSegments = url.pathname.split('/');
                    const codeFromScan = pathSegments[pathSegments.length - 1];

                    if (codeFromScan) {
                        setCode(codeFromScan.toUpperCase());
                        setIsScannerOpen(false); // Close the scanner
                        toast.success('QR Code Scanned!');
                        navigate(`/receive/${codeFromScan.toUpperCase()}`);
                    }
                } catch (e) {
                    toast.error("Invalid QR code format.");
                }
            };

            const onScanFailure = (errorMessage) => {
                // Can be ignored
            };
            
            // Start the scanner
            qrScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure)
                .catch(err => {
                    console.error("Unable to start QR scanner", err);
                    toast.error("Could not start camera. Please check permissions.");
                    setIsScannerOpen(false);
                });

            // Cleanup function to stop the camera
            return () => {
                if (qrScanner.isScanning) {
                    qrScanner.stop().catch(err => console.warn("QR Scanner failed to stop.", err));
                }
            };
        }
    }, [isScannerOpen, navigate]);

    const handleFetchFiles = async (fetchCode) => {
        if (!fetchCode) return;
        setIsLoading(true);
        setError('');
        setFiles([]);
        try {
            const response = await getSharedItems(fetchCode);
            setFiles(response.data);
            if (response.data.length === 0) {
                setError('No files found for this code.');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid code or expired link.');
            toast.error(err.response?.data?.msg || 'Failed to fetch files.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (shareCode) {
            setCode(shareCode.toUpperCase());
            handleFetchFiles(shareCode.toUpperCase());
        }
    }, [shareCode]);

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this file permanently?')) {
            return;
        }
        try {
            await deleteItem(itemId);
            setFiles(files.filter(file => file._id !== itemId));
            toast.success('Item deleted!');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Could not delete the item.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate(`/receive/${code}`);
    };

    return (
        <div className="receive-page">
            <form onSubmit={handleSubmit} className="receive-form">
                <h2>Receive Files</h2>
                <p>Enter a share code or scan a QR code.</p>
                <input
                    type="text"
                    placeholder="e.g. ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="code-input"
                />
                <div className="receive-buttons">
                    <button type="submit" className="btn btn-primary" disabled={isLoading || !code}>
                        Get Files
                    </button>
                    <button type="button" className="btn" onClick={() => setIsScannerOpen(true)}>
                        📷 Scan Code
                    </button>
                </div>
            </form>

            {isScannerOpen && (
                <div className="scanner-modal-overlay" onClick={() => setIsScannerOpen(false)}>
                    <div className="scanner-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div id="qr-reader" style={{ width: '100%' }}></div>
                        <button className="btn btn-danger" style={{marginTop: '1rem'}} onClick={() => setIsScannerOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}
            
            {isLoading && <Loader />}
            {error && <p className="error-text">{error}</p>}
            
            {files.length > 0 && (
                <ItemList 
                    items={files} 
                    onDelete={isAuthenticated ? handleDelete : null} 
                    shareCode={shareCode}
                />
            )}
        </div>
    );
};

export default ReceivePage;