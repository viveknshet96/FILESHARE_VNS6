import React, { useState, useEffect, useContext } from 'react'; // Added useContext
import { AuthContext } from '../context/AuthContext'; // Added AuthContext
import { getItems, createFolder, uploadFiles, createShareLink, deleteItem } from '../api';
import ItemList from '../components/ItemList';
import FileUpload from '../components/FileUpload';
import Loader from '../components/Loader';
import ShareModal from '../components/ShareModal';
import { toast } from 'react-hot-toast';

const FileExplorerPage = () => {
    const [items, setItems] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [history, setHistory] = useState([{ _id: null, name: 'Home' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [shareInfo, setShareInfo] = useState({ isOpen: false, code: null });
    const [selectedItems, setSelectedItems] = useState([]);

    // Get the user from the context to check if they are a guest
    const { state } = useContext(AuthContext);
    const isGuest = !state.isAuthenticated; // A simple way to check if it's a guest

    const loadItems = async (folderId) => {
        setIsLoading(true);
        setSelectedItems([]); 
        try {
            const response = await getItems(folderId);
            setItems(response.data);
        } catch (error) {
            // No toast error on initial load for a better UX
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isGuest) { // Only load items if the user is not a guest
            loadItems(currentFolder);
        }
    }, [currentFolder, isGuest]);

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
                await createFolder(folderName, currentFolder);
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
            await uploadFiles(Array.from(files), currentFolder);
            toast.success('Files uploaded!');
            loadItems(currentFolder);
        } catch (error) {
            toast.error('Upload failed.');
        } finally {
            setIsLoading(false);
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
                    <button 
                        className="btn btn-success" 
                        onClick={handleCreateShareFromSelection}
                        disabled={selectedItems.length === 0}
                    >
                        Share ({selectedItems.length})
                    </button>
                    <button className="btn" onClick={handleCreateFolder}>+ New Folder</button>
                </div>
            </div>
            
            <FileUpload onUpload={handleUpload} disabled={isLoading} />

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