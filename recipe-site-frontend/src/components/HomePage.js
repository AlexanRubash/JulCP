import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/HomePage.css'; // Подключение стилей

function HomePage() {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="home-page">
            <header className="home-page-header">
                <button onClick={() => handleNavigate('/login')} className="home-button">
                    Войти
                </button>
                <button onClick={() => handleNavigate('/register')} className="home-button">
                    Регистрация
                </button>
            </header>
            <main className="home-page-main">
                <h1>Добро пожаловать в наше приложение!</h1>
                <p>
                    Здесь вы можете:
                </p>
                <ul>
                    <li>Искать рецепты по продуктам, тегам и названию.</li>
                    <li>Добавлять свои рецепты и делиться ими с другими.</li>
                    <li>Сохранять любимые рецепты в избранное.</li>
                    <li>Управлять своим списком продуктов.</li>
                </ul>
            </main>
            <footer className="home-page-footer">
                <p>© 2024 Наше Приложение. Все права защищены.</p>
            </footer>
        </div>
    );
}

export default HomePage;
