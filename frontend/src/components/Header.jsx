import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
// Import your logo file from the assets folder
import logo from '../assets/logo.png'; 

const Header = () => {
    const { state, dispatch } = useContext(AuthContext);
    const { isAuthenticated, user } = state;
    const navigate = useNavigate();

    const onLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    return (
        <header className="header">
            <Link to={isAuthenticated ? "/" : "/login"} className="logo-link">
                {/* Add the image tag for your logo */}
                <img src={logo} alt="V'Share Logo" className="logo-image" />
                <span className="logo-text">V'Share</span>
            </Link>
            
            <div className="header-user-info">
                {isAuthenticated && user ? (
                    <>
                        <span>Welcome, {user.name}</span>
                        <button onClick={onLogout} className="btn btn-secondary">Logout</button>
                    </>
                ) : (
                    <div className="auth-links">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;