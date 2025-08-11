import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
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

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader />
            </div>
        );
    }

    return (
        <div className="container">
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            
            {/* ✅ FIX: The main navigation is now always visible */}
            <nav className="main-nav">
                {/* The "My Files" link only appears if the user is logged in */}
                {isAuthenticated && (
                    <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Files</NavLink>
                )}
                <NavLink to="/receive" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Receive</NavLink>
            </nav>
            
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
                    <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
                    <Route path="/guest" element={<GuestPage />} />
                    
                    {/* ✅ FIX: The Receive routes are now public and no longer use PrivateRoute */}
                    <Route path="/receive" element={<ReceivePage />} />
                    <Route path="/receive/:shareCode" element={<ReceivePage />} />

                    {/* Private Routes */}
                    <Route path="/" element={<PrivateRoute><FileExplorerPage /></PrivateRoute>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;