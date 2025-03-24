import React, { useState } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import '../css/Header.css';
import { searchRecipesByName } from '../../api'; // Импортируем функцию из api.js

const Header = ({ onLogout, onNavigate, token }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const toggleUserMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleMobileNav = () => {
        setMobileNavOpen(!mobileNavOpen);
    };

    const handleNavigation = (page) => {
        console.log(page);
        onNavigate(page);
        if (page !== 'search') { // Очищаем поиск только если не на странице поиска
            setSearchResults([]);
        }
    };

    // Функция для обработки потери фокуса на инпуте
    const handleBlur = () => {
        setSearchResults([]); // Очищаем результаты поиска
    };

    const handleSearch = async (text) => {
        setSearchText(text);
        if (text.length > 2) { // Выполняем поиск только если длина строки > 2
            clearTimeout(window.searchTimeout); // Очищаем предыдущий таймер
            window.searchTimeout = setTimeout(async () => {
                try {
                    const data = await searchRecipesByName(text, token); // Вызов функции из api.js
                    setSearchResults(Array.isArray(data) ? data : [data]);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    setSearchResults([]);
                }
            }, 500); // Задержка 500 мс перед запросом
        } else {
            setSearchResults([]); // Очистка результатов, если длина строки <= 2
        }
    };

    return (
        <header className="header">
            <h1>Recipe Site</h1>
            <button
                className="burger-menu"
                onClick={toggleMobileNav}
                aria-label="Toggle Navigation"
            >
                {mobileNavOpen ? <FaTimes size={24}/> : <FaBars size={24}/>}
            </button>
            <nav
                className={`main-nav ${mobileNavOpen ? 'mobile-open' : ''}`}
            >
                <button className="nav-item" onClick={() => handleNavigation('search')}>
                    Search
                </button>
                <button className="nav-item" onClick={() => handleNavigation('tags')}>
                    Search by Tags
                </button>
                <button className="nav-item" onClick={() => handleNavigation('products')}>
                    All products
                </button>

            </nav>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchText}
                    onChange={(e) => handleSearch(e.target.value)}
                    onBlur={handleBlur} // Добавляем обработчик onBlur
                />
                {searchResults.length > 0 && (
                    <ul className="search-results">
                        {searchResults.map((recipe) => (
                            <li
                                key={recipe.recipe_id}
                                onClick={() => handleNavigation(`recipe/${recipe.recipe_id}`)}
                                className="search-result-item"
                            >
                                {recipe.image ? (
                                    <img
                                        className="search-result-image"
                                        src={recipe.image?.image_url || 'default-placeholder-image.jpg'}
                                        alt={recipe.name}
                                    />
                                ) : null}
                                <span className="search-result-name" >{recipe.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="user-menu">
                <FaUserCircle
                    className="user-icon"
                    size={32}
                    onClick={toggleUserMenu}
                />
                {menuOpen && (
                    <div className="dropdown-menu">
                        <button
                            className="menu-item menu-button"
                            onClick={() => handleNavigation('favorites')}
                        >
                            Favorites
                        </button>
                        <button className="menu-item menu-button" onClick={() => handleNavigation('my-recipes')}>
                            My Recipes
                        </button>
                        <button
                            className="menu-item menu-button"
                            onClick={() => handleNavigation('create-recipe')}
                        >
                            Create Recipe
                        </button>
                        <button
                            className="menu-item menu-button"
                            onClick={() => handleNavigation('my-products')}
                        >
                            My Products
                        </button>
                        <button
                            className="menu-item menu-button"
                            onClick={() => handleNavigation('user-consumed-products')}
                        >
                            user-consumed-products
                        </button>
                        <button
                            className="menu-item menu-button"
                            onClick={() => handleNavigation('user-meal-plan')}
                        >
                            user-meal-plan
                        </button>
                        <button
                            className="menu-item logout-button"
                            onClick={onLogout}
                        >
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
