import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getSharedItems, deleteItem } from '../api'; // Use getSharedItems
import ItemList from '../components/ItemList'; // Correctly import ItemList
import Loader from '../components/Loader';

const ReceivePage = () => {
    const [code, setCode] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { shareCode } = useParams();
    const navigate = useNavigate();

    const handleFetchFiles = async (fetchCode) => {
        if (!fetchCode) return;
        setIsLoading(true);
        setError('');
        setFiles([]);
        try {
            // Use the new API function
            const response = await getSharedItems(fetchCode);
            setFiles(response.data);
            if(response.data.length === 0) {
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
            // Use the new deleteItem function
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
        // ... (no changes to the JSX part)
        <div className="receive-page">
            <form onSubmit={handleSubmit} className="receive-form">
                <h2>Receive Files</h2>
                <p>Enter the share code to download files.</p>
                <input
                    type="text"
                    placeholder="e.g. ABC123"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="code-input"
                />
                <button type="submit" className="btn" disabled={isLoading || !code}>
                    Get Files
                </button>
            </form>
            
            {isLoading && <Loader />}
            {error && <p className="error-text">{error}</p>}
            {files.length > 0 && <ItemList items={files} onDelete={handleDelete} />}
        </div>
    );
};

export default ReceivePage;
