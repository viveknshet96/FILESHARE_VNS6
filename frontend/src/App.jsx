import React, { useContext } from 'react';
// 1. Import useLocation
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import FileExplorerPage from './pages/FileExplorerPage';
import ReceivePage from './pages/ReceivePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GuestPage from './pages/GuestPage';
import Loader from './components/Loader';
import './App.css';

function App() {
    const { state } = useContext(AuthContext);
    const { isAuthenticated, loading } = state;
    const location = useLocation(); // 2. Get the current location

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader />
            </div>
        );
    }

    // 3. Determine if we are on a page that should NOT show the main nav
    const hideMainNav = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className="container">
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            
            {/* ✅ FIX: The navigation bar is now hidden on the login and register pages */}
            {!hideMainNav && (
                <nav className="main-nav">
                    {/* The "My Files" link still only appears if logged in */}
                    {isAuthenticated && (
                        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Files</NavLink>
                    )}
                    <NavLink to="/receive" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Receive</NavLink>
                </nav>
            )}
            
            <main>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/guest" element={<GuestPage />} />
                    <Route path="/receive" element={<ReceivePage />} />
                    <Route path="/receive/:shareCode" element={<ReceivePage />} />
                    <Route path="/" element={<PrivateRoute><FileExplorerPage /></PrivateRoute>} />
                </Routes>
            </main>
        </div>
    );
}
export default App;