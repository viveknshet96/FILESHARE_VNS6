import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_SUCCESS':
            setAuthToken(action.payload.token);
            localStorage.setItem('token', action.payload.token);
            return { ...state, isAuthenticated: true, token: action.payload.token, loading: false };
        case 'USER_LOADED':
            return { ...state, isAuthenticated: true, user: action.payload, loading: false };
        case 'AUTH_ERROR':
        case 'LOGOUT':
            setAuthToken(null);
            localStorage.removeItem('token');
            return { ...state, token: null, isAuthenticated: false, user: null, loading: false };
        default:
            return state;
    }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
        } else {
            dispatch({ type: 'AUTH_ERROR' });
            return;
        }
        try {
            const res = await axios.get('/api/auth');
            dispatch({ type: 'USER_LOADED', payload: res.data });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (formData) => {
        try {
            const res = await axios.post('/api/auth/login', formData);
            dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
            await loadUser();
            toast.success('Login successful!');
            return true; // Returns true on success
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Login failed.';
            toast.error(errorMsg);
            dispatch({ type: 'AUTH_ERROR' });
            return false; // Returns false on failure
        }
    };

    const register = async (formData) => {
        try {
            await axios.post('/api/auth/register', formData);
            toast.success('Registration successful! Please log in.');
            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.errors ? err.response.data.errors[0].msg : err.response.data.msg;
            toast.error(errorMsg || 'Registration failed.');
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ state, login, register, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};