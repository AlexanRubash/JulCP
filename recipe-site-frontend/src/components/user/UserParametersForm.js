
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserParameters } from '../../api';
import {jwtDecode} from "jwt-decode";

function UserParametersForm({token}) {
    const [parameters, setParameters] = useState({
        age: '',
        weight: '',
        height: '',
        goal: 'Похудеть',
        activity_level: 'Средняя'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setParameters({ ...parameters, [name]: value });
    };
    const onNavigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createUserParameters( parameters, token);
            alert('Параметры сохранены!');
            const decodedToken = jwtDecode(token);
            onNavigate(`/user-unwated-products/${decodedToken.user_id}`);
        } catch (error) {
            console.error('Ошибка при сохранении параметров:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="number" name="age" placeholder="Возраст" value={parameters.age} onChange={handleChange} required />
            <input type="number" name="weight" placeholder="Вес (кг)" value={parameters.weight} onChange={handleChange} required />
            <input type="number" name="height" placeholder="Рост (см)" value={parameters.height} onChange={handleChange} required />
            <select name="goal" value={parameters.goal} onChange={handleChange}>
                <option value="Похудеть">Похудеть</option>
                <option value="Набрать вес">Набрать вес</option>
                <option value="Сохранить вес">Сохранить вес</option>
            </select>
            <select name="activity_level" value={parameters.activity_level} onChange={handleChange}>
                <option value="Минимальная активность">Минимальная активность</option>
                <option value="Слабая активность">Слабая активность</option>
                <option value="Средняя">Средняя</option>
                <option value="Интенсивная">Интенсивная</option>
            </select>
            <button type="submit">Сохранить параметры</button>
        </form>
    );
}

export default UserParametersForm;
