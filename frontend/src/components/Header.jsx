import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = () => {
    return (
        <header className="header">
            <Link to="/" className="logo-link">
                <img src={logo} alt="V'Share Logo" className="logo-image" />
                <span className="logo-text">V'Share</span>
            </Link>
        </header>
    );
};

export default Header;