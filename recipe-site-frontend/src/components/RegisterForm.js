import React, { useState } from 'react';
import { registerUser } from '../api';

function RegisterForm() {
    const [formData, setFormData] = useState({ username: '', password: '', role: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await registerUser(formData);
        alert(result);
    };

    return (
        <form onSubmit={handleSubmit}>
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
            <input
                type="text"
                name="role"
                placeholder="Role (optional)"
                onChange={handleChange}
                value={formData.role}
            />
            <button type="submit">Register</button>
        </form>
    );
}

export default RegisterForm;
