import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const { name, email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        try {
            await registerUser({ name, email, password });
            
            // ✅ CHANGE: Display a success message and redirect to the login page.
            toast.success('Registration successful! Please log in.');
            navigate('/login');

        } catch (err) {
            const errorMsg = err.response.data.errors ? err.response.data.errors[0].msg : err.response.data.msg;
            toast.error(errorMsg || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={onSubmit}>
                <h2>Create an Account</h2>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="Name" required />
                <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required />
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required />
                <button type="submit" className="btn">Register</button>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
};

export default RegisterPage;