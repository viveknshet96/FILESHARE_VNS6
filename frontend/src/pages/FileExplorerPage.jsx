import React, { useState, useEffect } from "react";
import { getItems, createFolder, uploadFiles, createShareLink, deleteItem } from '../api';
import ItemList from "../components/ItemList";
import FileUpload from "../components/FileUpload";
import Loader from "../components/Loader";
import ShareModal from "../components/ShareModal"; // Import the new modal
import { toast } from "react-hot-toast";

const FileExplorerPage = () => {
  const [items, setItems] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // null is the root
  const [history, setHistory] = useState([{ _id: null, name: "Home" }]); // For breadcrumbs
  const [isLoading, setIsLoading] = useState(false);
  // NEW STATE: To control the share modal
  const [shareInfo, setShareInfo] = useState({ isOpen: false, code: null });
  // NEW STATE: To track which items are selected
  const [selectedItems, setSelectedItems] = useState([]);

  const loadItems = async (folderId) => {
    setIsLoading(true);
    setSelectedItems([]); 
    try {
      const response = await getItems(folderId);
      setItems(response.data);
    } catch (error) {
      toast.error("Failed to load items.");
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
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      try {
        await createFolder(folderName, currentFolder);
        toast.success("Folder created!");
        loadItems(currentFolder); // Refresh
      } catch (error) {
        toast.error(error.response?.data?.msg || "Failed to create folder.");
      }
    }
  };

  const handleUpload = async (files) => {
    setIsLoading(true);
    try {
      // This API call now matches the new backend
      await uploadFiles(Array.from(files), currentFolder);
      toast.success("Files uploaded!");
      loadItems(currentFolder); // Refresh
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // NEW FUNCTION: To handle the API call and open the modal
  const handleShareItem = async (itemId) => {
    try {
      const response = await createShareLink(itemId);
      setShareInfo({ isOpen: true, code: response.data.code });
    } catch (error) {
      toast.error("Failed to create share link.");
    }
  };

  // NEW FUNCTION: To handle checking/unchecking items
    const handleSelectItem = (itemId) => {
        setSelectedItems(prevSelected => {
            if (prevSelected.includes(itemId)) {
                // If already selected, remove it
                return prevSelected.filter(id => id !== itemId);
            } else {
                // If not selected, add it
                return [...prevSelected, itemId];
            }
        });
    };

    // NEW FUNCTION: Creates a share link from the selected items
    const handleCreateShareFromSelection = async () => {
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to share.');
            return;
        }
        try {
            const response = await createShareLink(selectedItems);
            setShareInfo({ isOpen: true, code: response.data.code });
            setSelectedItems([]); // Clear selection after sharing
        } catch (error) {
            toast.error("Failed to create share link.");
        }
    };


  // --- ADD THIS NEW FUNCTION ---
    const handleDeleteItem = async (itemId) => {
        // Ask for confirmation to prevent accidental deletion
        if (!window.confirm('Are you sure you want to permanently delete this item?')) {
            return;
        }

        try {
            await deleteItem(itemId);
            // Instantly remove the item from the view without a page reload
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
                    {/* The Share button is REMOVED from here */}
                    <button className="btn" onClick={handleCreateFolder}>+ New Folder</button>
                </div>
            </div>
            
            <FileUpload onUpload={handleUpload} disabled={isLoading} />

            {/* ✅ FIX: The Share button is MOVED to a new container here */}
            <div className="share-button-container">
                <button 
                    className="btn btn-success" 
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