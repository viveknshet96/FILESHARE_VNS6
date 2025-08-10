import React, { useState } from 'react';

const FileUpload = ({ onUpload, disabled }) => {
    const [dragging, setDragging] = useState(false);

    const handleFiles = (files) => {
        if (files && files.length > 0) {
            onUpload(files);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (disabled) return;
        handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e) => {
        handleFiles(e.target.files);
        e.target.value = null; // Reset input to allow re-uploading the same file
    };
    
    return (
        <div 
            className={`file-upload ${dragging ? 'file-upload--active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                id="fileInput"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }} 
                disabled={disabled}
            />
            
            {/* ✅ NEW: Improved layout with icon and clearer text */}
            <div className="file-upload-content">
                <p className="file-upload-main-text">Drag & Drop files here</p>
                <p className="file-upload-sub-text">or</p>
                <label htmlFor="fileInput" className="btn">
                    Browse Files
                </label>
                {disabled && <p className="upload-indicator">Uploading...</p>}
            </div>
        </div>
    );
};

export default FileUpload;