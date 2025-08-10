import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import FileUpload from '../components/FileUpload';
import ShareModal from '../components/ShareModal';
import Loader from '../components/Loader';
import ItemList from '../components/ItemList'; // Import the ItemList component
import { createShareLink } from '../api';

// A separate upload function for the public guest route
const uploadGuestFiles = (files, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return axios.post('/api/guest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
};

const GuestPage = () => {
    const [shareInfo, setShareInfo] = useState({ isOpen: false, code: null });
    const [isLoading, setIsLoading] = useState(false);
    
    // ✅ NEW: State to hold the files uploaded in this session
    const [uploadedItems, setUploadedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleGuestUpload = async (files) => {
        if (!files || files.length === 0) return;
        setIsLoading(true);
        try {
            // Step 1: Upload the files using the guest route
            const uploadResponse = await uploadGuestFiles(Array.from(files));
            // ✅ NEW: Save the uploaded files to our state to display them
            setUploadedItems(uploadResponse.data);
            // ✅ NEW: Automatically select all uploaded files for convenience
            setSelectedItems(uploadResponse.data.map(item => item._id));
            toast.success('Files uploaded! Ready to share.');
        } catch (error) {
            toast.error('Something went wrong during upload.');
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
            return toast.error('Please select at least one file to share.');
        }
        try {
            const shareResponse = await createShareLink(selectedItems);
            setShareInfo({ isOpen: true, code: shareResponse.data.code });
            setUploadedItems([]); // Clear the list after sharing
            setSelectedItems([]);
        } catch (error) {
            toast.error('Failed to create share link.');
        }
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2>Send Files as a Guest</h2>
                <p>Files uploaded here will be automatically deleted after 24 hours.</p>
            </div>
            
            <FileUpload onUpload={handleGuestUpload} disabled={isLoading} />

            {/* ✅ NEW: Share button is now below the upload area */}
            <div className="share-button-container">
                 <button 
                    className="btn btn-success" 
                    onClick={handleCreateShareFromSelection}
                    disabled={selectedItems.length === 0}
                >
                    Share ({selectedItems.length}) Selected
                </button>
            </div>
            
            {isLoading && <Loader />}

            {/* ✅ NEW: Display the list of uploaded files */}
            {uploadedItems.length > 0 && !isLoading && (
                 <ItemList 
                    items={uploadedItems}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                    // We don't pass folder or delete handlers for guests
                />
            )}
            
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