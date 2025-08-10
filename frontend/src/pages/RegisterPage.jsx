import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (formData.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        // The register function from the context will handle the API call
        const success = await register(formData);
        if (success) {
            // On success, navigate to the login page
            navigate('/login');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={onSubmit}>
                <h2>Create an Account</h2>
                <input type="text" name="name" value={formData.name} onChange={onChange} placeholder="Name" required />
                <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="Email" required />
                <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Password" required />
                <button type="submit" className="btn">Register</button>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
};

export default RegisterPage;