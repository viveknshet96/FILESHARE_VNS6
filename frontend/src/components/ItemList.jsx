import React from 'react';
import { filesize } from 'filesize';
import { getDownloadUrl } from '../api';

const ItemList = ({ items, onFolderClick, onDelete, onShareClick }) => {
    return (
        <div className="item-list">
            {items.map(item => (
                <div 
                    key={item._id} 
                    className="item"
                    onDoubleClick={item.type === 'folder' && onFolderClick ? () => onFolderClick(item) : null}
                >
                    <div className="item-info">
                        {/* Checkbox is now removed */}
                        <span className="item-icon">{item.type === 'folder' ? '📁' : '📄'}</span>
                        <span className="item-name">{item.name}</span>
                    </div>
                    <div className="item-actions">
                        {item.type === 'file' && (
                             <a href={getDownloadUrl(item.fileName)} className="btn" download={item.name}>Download</a>
                        )}
                        {item.type === 'folder' && onFolderClick && (
                            <button onClick={() => onFolderClick(item)} className='btn'>Open</button>
                        )}
                        {/* ✅ Individual "Share" button is back */}
                        <button onClick={() => onShareClick(item._id)} className="btn btn-success">Share</button>
                        {onDelete && (
                            <button onClick={() => onDelete(item._id)} className="btn btn-danger">Delete</button>
                        )}
                    </div>
                </div>
            ))}
            {items.length === 0 && <p>This folder is empty.</p>}
        </div>
    );
};

export default ItemList;