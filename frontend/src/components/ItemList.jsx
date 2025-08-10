import React from 'react';
import { filesize } from 'filesize';
import { getDownloadUrl } from '../api';

const ItemList = ({ items, onFolderClick, onDelete, selectedItems = [], onSelectItem }) => {
    
    // Helper function to prevent a click on a button from also selecting the item
    const handleActionClick = (e, action) => {
        e.stopPropagation(); // This stops the click from reaching the parent div
        if (action) action();
    };
    
    return (
        <div className="item-list">
            {items.map(item => (
                <div 
                    key={item._id} 
                    className={`item ${selectedItems.includes(item._id) ? 'selected' : ''}`}
                    // ✅ NEW: Clicking anywhere on the item will now select it
                    onClick={() => onSelectItem(item._id)}
                    onDoubleClick={item.type === 'folder' && onFolderClick ? () => onFolderClick(item) : null}
                >
                    <div className="item-info">
                        {onSelectItem && (
                            <input 
                                type="checkbox" 
                                className="item-checkbox"
                                checked={selectedItems.includes(item._id)}
                                // Use the helper to stop propagation
                                onClick={(e) => handleActionClick(e)}
                                onChange={() => onSelectItem(item._id)}
                            />
                        )}
                        <span className="item-icon">{item.type === 'folder' ? '📁' : '📄'}</span>
                        <span className="item-name">{item.name}</span>
                    </div>
                    <div className="item-actions">
                        {item.type === 'file' && (
                             <a 
                                href={getDownloadUrl(item.fileName)} 
                                className="btn" 
                                download={item.name} 
                                // Use stopPropagation to prevent selection on download click
                                onClick={(e) => e.stopPropagation()}
                            >
                                Download
                            </a>
                        )}
                        {item.type === 'folder' && onFolderClick && (
                            <button 
                                onClick={(e) => handleActionClick(e, () => onFolderClick(item))} 
                                className='btn'
                            >
                                Open
                            </button>
                        )}
                        {onDelete && (
                            <button 
                                onClick={(e) => handleActionClick(e, () => onDelete(item._id))} 
                                className="btn btn-danger"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {items.length === 0 && <p>No items found.</p>}
        </div>
    );
};
export default ItemList;
