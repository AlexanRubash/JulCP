// src/components/LoginForm.js
import React, { useState } from 'react';
import { loginUser } from '../api';

function LoginForm({ onLoginSuccess }) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await loginUser(formData);
            onLoginSuccess(token); // Передаем токен в родительский компонент
        } catch (error) {
            setError('Failed to log in');
        }
    };

    return (
        <div className="login-form-container">
        <form className="login-form" onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                placeholder="Username"
                onChange={handleChange}
                value={formData.username}
                required
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
                required
            />
            <button type="submit">Login</button>
            {error && <p className="error">{error}</p>}
        </form>
        </div>
    );
}

export default LoginForm;