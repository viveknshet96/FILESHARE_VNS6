import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getGuestItems, createGuestFolder, uploadGuestFiles, createGuestShareLink } from '../api';
import ItemList from '../components/ItemList';
import FileUpload from '../components/FileUpload';
import Loader from '../components/Loader';
import ShareModal from '../components/ShareModal';

const GuestPage = () => {
    const [items, setItems] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [history, setHistory] = useState([{ _id: null, name: 'Guest Files' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [shareInfo, setShareInfo] = useState({ isOpen: false, code: null });
    const [selectedItems, setSelectedItems] = useState([]);

    const loadItems = async (folderId) => {
        setIsLoading(true);
        setSelectedItems([]); 
        try {
            const response = await getGuestItems(folderId);
            setItems(response.data);
        } catch (error) {
            toast.error('Failed to load guest items.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadItems(currentFolder);
    }, [currentFolder]);

    const handleFolderClick = (folder) => {
        setCurrentFolder(folder._id);
        setHistory(prevHistory => [...prevHistory, folder]);
    };

    const handleBreadcrumbClick = (folderId, index) => {
        setCurrentFolder(folderId);
        setHistory(prevHistory => prevHistory.slice(0, index + 1));
    };
    
    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            try {
                await createGuestFolder(folderName, currentFolder);
                toast.success('Folder created!');
                loadItems(currentFolder);
            } catch (error) {
                toast.error(error.response?.data?.msg || 'Failed to create folder.');
            }
        }
    };
    
    const handleUpload = async (files) => {
        setIsLoading(true);
        try {
            await uploadGuestFiles(Array.from(files), currentFolder);
            toast.success('Files uploaded!');
            loadItems(currentFolder);
        } catch(error) {
            toast.error('Upload failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prevSelected => {
            if (prevSelected.includes(itemId)) {
                return prevSelected.filter(id => id !== itemId);
            } else {
                return [...prevSelected, itemId];
            }
        });
    };

    const handleCreateShareFromSelection = async () => {
        if (selectedItems.length === 0) {
            return toast.error('Please select at least one item to share.');
        }
        try {
            const response = await createGuestShareLink(selectedItems);
            setShareInfo({ isOpen: true, code: response.data.code });
            setSelectedItems([]);
        } catch (error) {
            toast.error('Failed to create share link.');
        }
    };

    // This delete function only removes items from the current session view
    const handleDeleteSelection = () => {
        if (selectedItems.length === 0) {
            return toast.error('Please select items to remove.');
        }
        setItems(currentItems => currentItems.filter(item => !selectedItems.includes(item._id)));
        setSelectedItems([]);
        toast.success(`${selectedItems.length} item(s) removed from session.`);
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2>Guest Mode</h2>
                <p>All files and folders created here will be automatically deleted after 24 hours.</p>
            </div>
            <div className="toolbar">
                <div className="breadcrumbs">
                    {history.map((folder, index) => (
                        <span key={folder._id || 'root'}>
                            <button onClick={() => handleBreadcrumbClick(folder._id, index)}>
                                {folder.name}
                            </button>
                            {index < history.length - 1 && ' / '}
                        </span>
                    ))}
                </div>
                <div className="toolbar-actions">
                    <button className="btn" onClick={handleCreateFolder}>+ New Folder</button>
                </div>
            </div>
            
            <FileUpload onUpload={handleUpload} disabled={isLoading} />

            <div className="share-button-container">
                 <button 
                    className="btn btn-primary" 
                    onClick={handleCreateShareFromSelection}
                    disabled={selectedItems.length === 0}
                >
                    Share ({selectedItems.length})
                </button>
                <button 
                    className="btn btn-danger"
                    onClick={handleDeleteSelection}
                    disabled={selectedItems.length === 0}
                >
                    Delete ({selectedItems.length})
                </button>
            </div>
            
            {isLoading ? <Loader /> : 
                <ItemList 
                    items={items} 
                    onFolderClick={handleFolderClick}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                />
            }
            
            {shareInfo.isOpen && (
                <ShareModal 
                    code={shareInfo.code}
                    onClose={() => setShareInfo({ isOpen: false, code: null })}
                />
            )}
        </div>
    );
};

export default GuestPage;