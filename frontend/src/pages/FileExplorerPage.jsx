import React, { useState, useEffect } from 'react';
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

    const loadItems = async (folderId) => {
        setIsLoading(true);
        try {
            const response = await getItems(folderId);
            setItems(response.data);
        } catch (error) {
            toast.error('Failed to load items.');
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

    // ✅ RESTORED LOGIC
    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            setIsLoading(true);
            try {
                await createFolder(folderName, currentFolder);
                toast.success('Folder created!');
                await loadItems(currentFolder); // Refresh the list
            } catch (error) {
                toast.error(error.response?.data?.msg || 'Failed to create folder.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    // ✅ RESTORED LOGIC
    const handleUpload = async (files) => {
        setIsLoading(true);
        try {
            await uploadFiles(Array.from(files), currentFolder);
            toast.success('Files uploaded!');
            await loadItems(currentFolder); // Refresh the list
        } catch(error) {
            toast.error('Upload failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // ✅ RESTORED LOGIC
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to permanently delete this item?')) {
            return;
        }
        setIsLoading(true);
        try {
            await deleteItem(itemId);
            toast.success('Item deleted!');
            await loadItems(currentFolder); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Could not delete the item.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareItem = async (itemId) => {
        try {
            const response = await createShareLink(itemId);
            setShareInfo({ isOpen: true, code: response.data.code });
        } catch (error) {
            toast.error("Failed to create share link.");
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

            {isLoading ? <Loader /> : 
                <ItemList 
                    items={items} 
                    onFolderClick={handleFolderClick} 
                    onDelete={handleDeleteItem}
                    onShareClick={handleShareItem}
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