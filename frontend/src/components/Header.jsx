import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import logo from '../assets/logo.png';

const Header = () => {
    const { state, dispatch } = useContext(AuthContext);
    const { isAuthenticated, user } = state;
    const navigate = useNavigate();
    const location = useLocation();

    const onLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    const renderAuthLinks = () => {
        // If on the login or register page, show the auth links
        if (location.pathname === '/login' || location.pathname === '/register') {
            return (
                <div className="auth-links">
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>
            );
        }
        // If on the guest page, show the guest info
        if (location.pathname === '/guest') {
             return (
                <div className="header-user-info">
                    <span>Welcome, Guest</span>
                    <Link to="/login" className="btn btn-secondary">Exit Guest Mode</Link>
                </div>
            );
        }
        // If authenticated and the user object is loaded, show the user info
        if (isAuthenticated && user) {
            return (
                <div className="header-user-info">
                    <span>Welcome, {user.name}</span>
                    <button onClick={onLogout} className="btn btn-secondary">Logout</button>
                </div>
            );
        }
        // Fallback for any other case (e.g., loading user but not yet available)
        // Or if the user is not authenticated and not on an auth/guest page
        return (
             <div className="auth-links">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </div>
        );
    };

    return (
        <header className="header">
            <Link to={isAuthenticated ? "/" : "/login"} className="logo-link">
                <img src={logo} alt="V'Share Logo" className="logo-image" />
                <span className="logo-text">V'Share</span>
            </Link>
            
            {renderAuthLinks()}
        </header>
    );
};

export default Header;