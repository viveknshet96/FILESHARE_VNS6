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
            // ... (drag and drop handlers remain the same)
        >
            <input 
                type="file" 
                id="fileInput"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }} 
                disabled={disabled}
            />
            
            {/* ✅ NEW: Add a separate input for folder uploads */}
            <input 
                type="file" 
                id="folderInput"
                webkitdirectory="true" // This is the magic attribute
                directory="true"       // Standard attribute
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }} 
                disabled={disabled}
            />
            
            <div className="file-upload-content">
                <span className="file-upload-icon">☁️</span>
                <p className="file-upload-main-text">Drag & Drop Files or Folders Here</p>
                <p className="file-upload-sub-text">or</p>
                <div className="upload-buttons">
                    <label htmlFor="fileInput" className="btn btn-primary">Browse Files</label>
                    <label htmlFor="folderInput" className="btn btn-secondary">Browse Folder</label>
                </div>
                {disabled && <p className="upload-indicator">Uploading...</p>}
            </div>
        </div>
    );
};


export default FileUpload;