import React, { useState, useEffect, useContext } from 'react'; // 1. Import useContext
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext'; // 2. Import the AuthContext
import { getSharedItems, deleteItem } from '../api';
import ItemList from '../components/ItemList';
import Loader from '../components/Loader';

const ReceivePage = () => {
    const { state } = useContext(AuthContext); // 3. Get the auth state from the context
    const { isAuthenticated } = state;

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
            
            {/* ✅ FIX: Only pass the 'onDelete' function if the user is logged in. */}
            {files.length > 0 && (
                <ItemList 
                    items={files} 
                    onDelete={isAuthenticated ? handleDelete : null} 
                />
            )}
        </div>
    );
};

export default ReceivePage;