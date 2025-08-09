import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children }) => {
    const { state } = useContext(AuthContext);
    const { isAuthenticated, loading } = state;

    if (loading) {
        return <Loader />; // Show loader while checking auth status
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />; // Redirect to login if not authenticated
    }

    return children; // Render the protected component if authenticated
};

export default PrivateRoute;