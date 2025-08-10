import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        const success = await login(formData);
        if (success) {
            // On success, navigate to the main page
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
                    Or, <Link to="/guest"><button>Send Files as a Guest</button>Send Files as a Guest</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;