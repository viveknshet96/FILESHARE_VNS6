import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await loginUser({ email, password });
            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
            toast.success('Login successful!');
            navigate('/');
        } catch (err) {
            toast.error(err.response.data.msg || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={onSubmit}>
                <h2>Login</h2>
                <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required />
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