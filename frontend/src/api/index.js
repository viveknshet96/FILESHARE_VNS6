import axios from 'axios';

// --- Authentication Functions ---
export const registerUser = (userData) => {
    return axios.post('/api/auth/register', userData);
};

export const loginUser = (userData) => {
    return axios.post('/api/auth/login', userData);
};

// --- Authenticated User Item Functions (for 'My Files') ---
export const getItems = (parentId = null) => {
    const url = parentId ? `/api/items?parentId=${parentId}` : '/api/items';
    return axios.get(url);
};

export const createFolder = (name, parentId = null) => {
    return axios.post('/api/items/folder', { name, parentId });
};

export const uploadFiles = (files, parentId = null, onUploadProgress) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        formData.append('paths', files[i].webkitRelativePath || files[i].name);
    }
    if (parentId) {
        formData.append('parentId', parentId);
    }
    return axios.post('/api/items/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
};

export const deleteItem = (itemId) => {
    return axios.delete(`/api/items/${itemId}`);
};

// --- Guest User Item Functions ---
export const getGuestItems = (parentId = null) => {
    const url = parentId ? `/api/guest?parentId=${parentId}` : '/api/guest';
    return axios.get(url);
};

export const createGuestFolder = (name, parentId = null) => {
    return axios.post('/api/guest/folder', { name, parentId });
};

export const uploadGuestFiles = (files, parentId = null, onUploadProgress) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
        formData.append('paths', files[i].webkitRelativePath || files[i].name);
    }
    if (parentId) {
        formData.append('parentId', parentId);
    }
    return axios.post('/api/guest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
};

// --- Sharing & Receiving Functions ---
export const createShareLink = (itemIds) => {
    // For logged-in users
    return axios.post('/api/items/share', { itemIds });
};

export const createGuestShareLink = (itemIds) => {
    // For guest users
    return axios.post('/api/guest/share', { itemIds });
};

export const getSharedItems = (shareCode) => {
    // Publicly accessible
    return axios.get(`/api/guest/receive/${shareCode}`);
};

// --- Download URL Helpers ---
export const getDownloadUrl = (fileName) => {
    // For single files
    return `${axios.defaults.baseURL}/uploads/${fileName}`;
};

export const getFolderDownloadUrl = (code, folderId) => {
    // For folders as ZIP
    return `${axios.defaults.baseURL}/api/guest/share/${code}/download/folder/${folderId}`;
};