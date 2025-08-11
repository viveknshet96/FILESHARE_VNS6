import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Helper function to set the token on all future API requests
const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

// Reducer to handle all state changes related to authentication
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

// Provider component that will wrap your entire application
export const AuthProvider = ({ children }) => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null,
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    // Checks for a token and loads user data on app start
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

    // Handles the complete login flow
    const login = async (formData, navigate) => {
        try {
            const res = await axios.post('/api/auth/login', formData);
            dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
            await loadUser(); // Immediately load user data
            toast.success('Login successful!');
            navigate('/'); // Redirect to the main page
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Login failed.';
            toast.error(errorMsg);
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    // Handles the registration flow
    const register = async (formData, navigate) => {
        try {
            await axios.post('/api/auth/register', formData);
            toast.success('Registration successful! Please log in.');
            navigate('/login'); // Redirect to the login page
        } catch (err) {
            const errorMsg = err.response?.data?.errors ? err.response.data.errors[0].msg : err.response?.data?.msg;
            toast.error(errorMsg || 'Registration failed.');
        }
    };

    return (
        <AuthContext.Provider value={{ state, login, register, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};