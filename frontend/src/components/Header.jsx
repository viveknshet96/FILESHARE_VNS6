import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../../public/logo.png'; // Import your logo image

const Header = () => {
    const { state, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

    return (
        <header className="header">
            <Link to="/" className="logo">
                <img src={logo} alt="V Share Logo" style={{ height: '30px', marginRight: '10px', verticalAlign: 'middle' }} />
                V Share
            </Link>
            <nav>
                {state.isAuthenticated ? (
                    <>
                        <span className="welcome-message">Welcome, {state.user?.name}</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;