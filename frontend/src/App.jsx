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
                    <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Files</NavLink>
                    <NavLink to="/receive" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Receive</NavLink>
                </nav>
            )}
            <main>
                <Routes>
                    {/* ✅ THIS LINE IS THE FIX: When 'isAuthenticated' becomes true, this route will automatically navigate to the main page. */}
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
                    
                    <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
                    <Route path="/" element={<PrivateRoute><FileExplorerPage /></PrivateRoute>} />
                    <Route path="/receive" element={<PrivateRoute><ReceivePage /></PrivateRoute>} />
                    <Route path="/receive/:shareCode" element={<PrivateRoute><ReceivePage /></PrivateRoute>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;