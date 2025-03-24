import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {loginUser, registerUser} from '../api';
import {jwtDecode} from 'jwt-decode';


function RegisterForm({onLoginSuccess}) {
    const [formData, setFormData] = useState({ user_id: '', username: '', password: '', role: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const onNavigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await registerUser(formData);
        onLoginSuccess(result); // Передаем токен в родительский компонент
        const decodedToken = jwtDecode(result);
        onNavigate(`/user-parameters/${decodedToken.user_id}`); // Переход на ввод параметров
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
            <button type="submit">Register</button>
        </form>
    );
}

export default RegisterForm;