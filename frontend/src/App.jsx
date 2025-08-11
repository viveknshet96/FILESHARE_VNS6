import React, { useContext } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
// ... other imports

function App() {
    const { state } = useContext(AuthContext);
    const { isAuthenticated, loading } = state;

    if (loading) {
        return (/* ... Loader ... */);
    }

    return (
        <div className="container">
            {/* ... Header and Nav ... */}
            <main>
                <Routes>
                    {/* ✅ FIX: Simplified login route. The redirect is now handled inside the login function. */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* ... Rest of your routes ... */}
                    <Route path="/guest" element={<GuestPage />} />
                    <Route path="/" element={<PrivateRoute><FileExplorerPage /></PrivateRoute>} />
                    <Route path="/receive" element={<PrivateRoute><ReceivePage /></PrivateRoute>} />
                    <Route path="/receive/:shareCode" element={<PrivateRoute><ReceivePage /></PrivateRoute>} />
                </Routes>
            </main>
        </div>
    );
}

export default App;