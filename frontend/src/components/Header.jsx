import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
// ✅ FIX: Import the logo from the correct relative path inside the 'src' folder
import logo from '../assets/file-sharing.png';

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
            <Link to="/" className="logo-link">
                {/* ✅ FIX: Use the imported 'logo' variable in the src attribute */}
                <img src={logo} alt="V Share Logo" className="logo-image" />
                <span className="logo-text">V Share</span>
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