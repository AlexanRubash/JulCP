// src/App.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Импортируем библиотеку для работы с cookies
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SearchPage from './components/SearchPage'; // Импортируем страницу поиска
import Header from './components/Header'; // Импортируем Header
//import './App.css'; // Подключаем стили

function App() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Состояние для отслеживания входа
    const [token, setToken] = useState(''); // Токен пользователя

    // Функция для обработки успешного входа
    const handleLoginSuccess = (token) => {
        Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'Strict' }); // Сохраняем токен в cookies
        setToken(token);
        setIsLoggedIn(true); // Устанавливаем флаг входа в систему
    };

    // Функция для выхода из системы
    const handleLogout = () => {
        Cookies.remove('token'); // Удаляем токен из cookies
        setToken('');
        setIsLoggedIn(false); // Сбрасываем состояние
    };

    // Эффект для восстановления состояния после перезагрузки
    useEffect(() => {
        const savedToken = Cookies.get('token');
        if (savedToken) {
            setToken(savedToken);
            setIsLoggedIn(true); // Восстанавливаем статус входа
        }
    }, []);

    return (
        <div className="App">
            {isLoggedIn && <Header onLogout={handleLogout} />} {/* Показать Header только если пользователь вошел в систему */}
            <div className="form-container">
                {isLoggedIn ? (
                    <SearchPage token={token} /> // Переход на страницу поиска после входа
                ) : (
                    <>
                        {isRegistering ? <RegisterForm /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
                        <button
                            className="toggle-btn"
                            onClick={() => setIsRegistering(!isRegistering)}
                        >
                            {isRegistering ? 'Already have an account? Log in' : 'Don’t have an account? Register'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;