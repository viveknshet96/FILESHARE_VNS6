
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const { state, dispatch } = useContext(AuthContext);
    const { isAuthenticated, user } = state;

    const onLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <header className="header">
            <h1 className="header__title">
                Quick<span>Share</span>
            </h1>
            {isAuthenticated && user && (
                <div className="header-user-info">
                    <span>Welcome, {user.name}</span>
                    <button onClick={onLogout} className="btn btn-secondary">Logout</button>
                </div>
            )}
        </header>
    );
};

export default Header;