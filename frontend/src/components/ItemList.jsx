import React from 'react';
import { filesize } from 'filesize';
import { getDownloadUrl } from '../api';

// We provide default empty values for the selection props.
const ItemList = ({ items, onFolderClick, onDelete, selectedItems = [], onSelectItem }) => {
    return (
        <div className="item-list">
            {items.map(item => (
                <div 
                    key={item._id} 
                    // The 'selected' class is now safely applied
                    className={`item ${selectedItems.includes(item._id) ? 'selected' : ''}`}
                    onDoubleClick={item.type === 'folder' && onFolderClick ? () => onFolderClick(item) : null}
                >
                    <div className="item-info">
                        {/* THIS IS THE MAIN CHANGE: The checkbox only appears if 'onSelectItem' is provided */}
                        {onSelectItem && (
                            <input 
                                type="checkbox" 
                                className="item-checkbox"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => onSelectItem(item._id)}
                            />
                        )}
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