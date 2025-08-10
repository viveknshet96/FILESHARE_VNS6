import axios from 'axios';

// --- Auth Functions ---
export const registerUser = (userData) => {
    return axios.post('/api/auth/register', userData);
};

export const loginUser = (userData) => {
    return axios.post('/api/auth/login', userData);
};

// --- Item Functions ---
export const getItems = (parentId = null) => {
    const url = parentId ? `/api/items?parentId=${parentId}` : '/api/items';
    return axios.get(url);
};

export const createFolder = (name, parentId = null) => {
    return axios.post('/api/items/folder', { name, parentId });
};

export const uploadFiles = (files, parentId = null, onUploadProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (parentId) formData.append('parentId', parentId);

    return axios.post('/api/items/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
};


export const createShareLink = (itemId) => {
    // Now sends a POST request to /api/items/share/:id
    return axios.post(`/api/items/share/${itemId}`);
};

export const getSharedItems = (code) => {
    return axios.get(`/api/items/share/${code}`);
};

export const deleteItem = (itemId) => {
    return axios.delete(`/api/items/${itemId}`);
};

export const getDownloadUrl = (fileName) => {
    // The download URL still needs the full base URL, as it's an <a> tag href
    return `${import.meta.env.VITE_API_URL}/uploads/${fileName}`;
};