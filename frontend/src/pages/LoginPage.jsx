import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access route state

    // ✅ This hook checks for passed credentials when the page loads
    useEffect(() => {
        if (location.state?.email && location.state?.password) {
            setFormData({
                email: location.state.email,
                password: location.state.password
            });
        }
    }, [location.state]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        const success = await login(formData);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={onSubmit}>
                <h2>Welcome Back!</h2>
                <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="Email" required />
                <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Password" required />
                <button type="submit" className="btn">Login</button>
                <p>Don't have an account? <Link to="/register">Register</Link></p>
                <p className="guest-link">
                    Or, <Link to="/guest">Send Files as a Guest</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;