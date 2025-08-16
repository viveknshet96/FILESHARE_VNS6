import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getItems, createFolder, uploadFiles, createShareLink, deleteItem } from '../api';
import ItemList from '../components/ItemList';
import FileUpload from '../components/FileUpload';
import Loader from '../components/Loader';
import ShareModal from '../components/ShareModal';
import UploadProgress from '../components/UploadProgress';
import { toast } from 'react-hot-toast';

const FileExplorerPage = () => {
    const [items, setItems] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [history, setHistory] = useState([{ _id: null, name: 'Home' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [shareInfo, setShareInfo] = useState({ isOpen: false, code: null });
    const [selectedItems, setSelectedItems] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    
    const { state } = useContext(AuthContext);

    const loadItems = async (folderId) => {
        setIsLoading(true);
        setSelectedItems([]); 
        try {
            const response = await getItems(folderId);
            setItems(response.data);
        } catch (error) {
            // Silently fail on load; user will see an empty folder.
            console.error("Failed to load items.", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only load items if the user is authenticated.
        if (state.isAuthenticated) {
            loadItems(currentFolder);
        }
    }, [currentFolder, state.isAuthenticated]);

    const handleFolderClick = (folder) => {
        setCurrentFolder(folder._id);
        setHistory(prevHistory => [...prevHistory, folder]);
    };

    const handleBreadcrumbClick = (folderId, index) => {
        setCurrentFolder(folderId);
        setHistory(prevHistory => prevHistory.slice(0, index + 1));
    };

    const handleCreateFolder = async () => {
        const folderName = prompt('Enter new folder name:');
        if (folderName) {
            try {
                await createFolder(folderName, currentFolder);
                toast.success('Folder created!');
                await loadItems(currentFolder);
            } catch (error) {
                toast.error(error.response?.data?.msg || 'Failed to create folder.');
            }
        }
    };

    const handleUpload = async (files) => {
        setIsLoading(true);
        setUploadProgress({});

        const progressHandler = (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ 'Uploading...': percentCompleted });
        };
        
        try {
            await uploadFiles(Array.from(files), currentFolder, progressHandler);
            toast.success('Files uploaded successfully!');
            await loadItems(currentFolder);
        } catch (error) {
            toast.error('Upload failed.');
        } finally {
            setIsLoading(false);
            setUploadProgress({});
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
            const response = await createShareLink(selectedItems);
            setShareInfo({ isOpen: true, code: response.data.code });
            setSelectedItems([]);
        } catch (error) {
            toast.error('Failed to create share link.');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to permanently delete this item?')) {
            return;
        }
        try {
            await deleteItem(itemId);
            setItems(currentItems => currentItems.filter(item => item._id !== itemId));
            toast.success('Item deleted!');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Could not delete the item.');
        }
    };

    return (
        <div>
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
            
            <UploadProgress uploadProgress={uploadProgress} />

            <div className="share-button-container">
                <button 
                    className="btn btn-primary" 
                    onClick={handleCreateShareFromSelection}
                    disabled={selectedItems.length === 0}
                >
                    Share ({selectedItems.length}) Selected
                </button>
            </div>

            {isLoading ? <Loader /> : 
                <ItemList 
                    items={items} 
                    onFolderClick={handleFolderClick} 
                    onDelete={handleDeleteItem}
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

export default FileExplorerPage;