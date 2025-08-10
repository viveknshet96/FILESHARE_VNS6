import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import logo from '../assets/logo.png';

const Header = () => {
    const { state, dispatch } = useContext(AuthContext);
    const { isAuthenticated, user } = state;
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get the current URL path

    const onLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    // Determine which header to render based on the current page
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isGuestPage = location.pathname === '/guest';

    // 1. Header for Login and Register pages
    if (isAuthPage) {
        return (
            <header className="header">
                <div className="logo-link">
                    <img src={logo} alt="V'Share Logo" className="logo-image" />
                    <span className="logo-text">V'Share</span>
                </div>
                <div className="auth-links">
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </div>
            </header>
        );
    }

    // 2. Header for the Guest page
    if (isGuestPage) {
        return (
            <header className="header">
                <div className="logo-link">
                    <img src={logo} alt="V'Share Logo" className="logo-image" />
                    <span className="logo-text">V'Share</span>
                </div>
                <div className="header-user-info">
                    <span>Welcome, Guest</span>
                    {/* Link to go back to the login page */}
                    <Link to="/login" className="btn btn-secondary">Exit Guest Mode</Link>
                </div>
            </header>
        );
    }

    // 3. Header for all other authenticated pages
    return (
        <header className="header">
            <Link to="/" className="logo-link">
                <img src={logo} alt="V'Share Logo" className="logo-image" />
                <span className="logo-text">V'Share</span>
            </Link>
            
            <div className="header-user-info">
                {isAuthenticated && user && (
                    <>
                        <span>Welcome, {user.name}</span>
                        <button onClick={onLogout} className="btn btn-secondary">Logout</button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;