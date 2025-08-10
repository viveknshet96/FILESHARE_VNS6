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
            {isAuthenticated && (
                <nav className="main-nav">
                    {/* ✅ FIX: NavLink now points to the new main page path */}
                    <NavLink to="/login/main" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Files</NavLink>
                    <NavLink to="/receive" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Receive</NavLink>
                </nav>
            )}
            <main>
                <Routes>
                    {/* ✅ FIX: Redirect authenticated users to the new main page path */}
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/login/main" /> : <LoginPage />} />
                    <Route path="/register" element={isAuthenticated ? <Navigate to="/login/main" /> : <RegisterPage />} />
                    <Route path="/guest" element={<GuestPage />} />
                    
                    {/* ✅ FIX: The main page route is now at /login/main */}
                    <Route path="/login/main" element={<PrivateRoute><FileExplorerPage /></PrivateRoute>} />
                    
                    <Route path="/receive" element={<PrivateRoute><ReceivePage /></PrivateRoute>} />
                    <Route path="/receive/:shareCode" element={<PrivateRoute><ReceivePage /></PrivateRoute>} />
                    
                    {/* Optional: Redirect the root path to the new main page if logged in */}
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/login/main" : "/login"} />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;