import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import FileExplorerPage from './pages/FileExplorerPage';
import ReceivePage from './pages/ReceivePage';
import './App.css';

function App() {
    return (
        <div className="container">
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <nav className="main-nav">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Send Files</NavLink>
                <NavLink to="/receive" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Receive</NavLink>
            </nav>
            <main>
                <Routes>
                    <Route path="/" element={<FileExplorerPage />} />
                    <Route path="/receive" element={<ReceivePage />} />
                    <Route path="/receive/:shareCode" element={<ReceivePage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;