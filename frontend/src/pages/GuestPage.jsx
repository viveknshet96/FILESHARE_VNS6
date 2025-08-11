import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import FileUpload from '../components/FileUpload';
import ShareModal from '../components/ShareModal';
import Loader from '../components/Loader';
import ItemList from '../components/ItemList';
// ✅ FIX: Import all necessary functions from the central api file
import { createGuestShareLink, uploadGuestFiles } from '../api';

// The local uploadGuestFiles function is now removed from here

const GuestPage = () => {
    const [shareInfo, setShareInfo] = useState({ isOpen: false, code: null });
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedItems, setUploadedItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const handleGuestUpload = async (files) => {
        if (!files || files.length === 0) return;
        setIsLoading(true);
        try {
            // Use the imported uploadGuestFiles function
            const uploadResponse = await uploadGuestFiles(Array.from(files));
            setUploadedItems(uploadResponse.data);
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
            // Use the public guest share function
            const shareResponse = await createGuestShareLink(selectedItems);
            setShareInfo({ isOpen: true, code: shareResponse.data.code });
            setUploadedItems([]);
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

            {uploadedItems.length > 0 && !isLoading && (
                <ItemList 
                    items={uploadedItems}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
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