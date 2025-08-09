import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// This helper function sets the token on all future axios requests
const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

// The reducer manages state changes
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            // ✅ This line is CRITICAL. It sets the token for all future requests.
            setAuthToken(action.payload.token);
            localStorage.setItem('token', action.payload.token);
            return { ...state, isAuthenticated: true, token: action.payload.token, loading: false };
        case 'USER_LOADED':
            return { ...state, isAuthenticated: true, user: action.payload, loading: false };
        case 'AUTH_ERROR':
        case 'LOGOUT':
            // ✅ This line is CRITICAL. It clears the token on logout.
            setAuthToken(null);
            localStorage.removeItem('token');
            return { ...state, token: null, isAuthenticated: false, user: null, loading: false };
        default:
            return state;
    }
};

export const AuthContext = createContext();

// The provider component that wraps your app
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

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};