import React from 'react';

const UploadProgress = ({ uploadProgress }) => {
    // Get an array of the files currently being uploaded
    const files = Object.keys(uploadProgress);

    // Don't render anything if there are no active uploads
    if (files.length === 0) {
        return null;
    }

    return (
        <div className="upload-progress-container">
            <h4>Uploading...</h4>
            {files.map(fileName => (
                <div key={fileName} className="progress-item">
                    <span className="progress-filename">{fileName}</span>
                    <div className="progress-bar-background">
                        <div 
                            className="progress-bar-foreground" 
                            style={{ width: `${uploadProgress[fileName]}%` }}
                        >
                            {uploadProgress[fileName]}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UploadProgress;