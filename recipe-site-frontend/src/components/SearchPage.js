// src/components/SearchPage.js
import React, { useState, useEffect } from 'react';
import { searchExactRecipes, searchPartialRecipes } from '../api'; // Импортируем функции для поиска
import './css/RecipeItem.css'; // В компоненте для рецепта


const SearchPage = ({ token }) => {
    const [searchText, setSearchText] = useState(''); // Текст для поиска
    const [exactRecipes, setExactRecipes] = useState([]); // Список точных рецептов
    const [partialRecipes, setPartialRecipes] = useState([]); // Список частичных рецептов
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [error, setError] = useState(''); // Ошибка
    const [exactPage, setExactPage] = useState(1); // Страница для точного поиска
    const [partialPage, setPartialPage] = useState(1); // Страница для частичного поиска
    const [hasMoreExact, setHasMoreExact] = useState(true); // Флаг для пагинации точного поиска
    const [hasMorePartial, setHasMorePartial] = useState(true); // Флаг для пагинации частичного поиска

    // Обработчик изменения текста поиска
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    // Обработчик отправки формы
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setExactPage(1);
        setPartialPage(1);
        setExactRecipes([]);
        setPartialRecipes([]);
        setHasMoreExact(true);
        setHasMorePartial(true);
        fetchExactRecipes(1);
        fetchPartialRecipes(1);
    };

    // Получение точных рецептов
    const fetchExactRecipes = async (page) => {
        if (!hasMoreExact) return;
        setLoading(true);
        try {
            const foundRecipes = await searchExactRecipes(searchText, token, page);
            setExactRecipes((prev) => [...prev, ...foundRecipes]);
            setHasMoreExact(foundRecipes.length > 0);
        } catch (err) {
            setError('Failed to fetch exact recipes');
        }
        setLoading(false);
    };

    // Получение частичных рецептов
    const fetchPartialRecipes = async (page) => {
        if (!hasMorePartial) return;
        setLoading(true);
        try {
            const foundRecipes = await searchPartialRecipes(searchText, token, page);
            setPartialRecipes((prev) => [...prev, ...foundRecipes]);
            setHasMorePartial(foundRecipes.length > 0);
        } catch (err) {
            setError('Failed to fetch partial recipes');
        }
        setLoading(false);
    };

    // Обработчик прокрутки вниз
    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
        if (bottom) {
            if (exactRecipes.length > 0) {
                setExactPage(exactPage + 1);
                fetchExactRecipes(exactPage + 1);
            }
            if (partialRecipes.length > 0) {
                setPartialPage(partialPage + 1);
                fetchPartialRecipes(partialPage + 1);
            }
        }
    };

    return (
        <div className="search-container" onScroll={handleScroll}>
            <form onSubmit={handleSearchSubmit}>
                <h2>Поиск рецепта</h2>
                <input
                    type="text"
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Enter ingredients (e.g., beef, mushrooms)"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {/* Точные рецепты */}
            <div className="recipe-list exact-recipes">
                <h3>Точное сопадение</h3>
                <div className="recipe-grid">
                    {exactRecipes.length > 0 ? (
                        exactRecipes.map((recipe) => (
                            <div key={recipe.recipe_id} className="recipe-item">
                                <h4>{recipe.name}</h4>

                                {/* Картинка рецепта */}
                                <div className="recipe-image">
                                    <img
                                        src={recipe.image?.image_url || 'https://via.placeholder.com/150'} // Используем картинку, если есть, или заглушку
                                        alt={recipe.name}
                                        className="recipe-thumbnail"
                                    />
                                </div>

                                <p>Cooking time: {recipe.cooking_time || 'N/A'}</p>
                                <p>Products: {recipe.products.map((prod) => prod.name).join(', ')}</p>
                            </div>
                        ))
                    ) : (
                        <p>No exact match recipes found</p>
                    )}
                </div>
            </div>

            {/* Частичные рецепты */}
            <div className="recipe-list partial-recipes">
                <h3>Partial Match Recipes</h3>
                <div className="recipe-grid">
                    {partialRecipes.length > 0 ? (
                        partialRecipes.map((recipe) => (
                            <div key={recipe.recipe_id} className="recipe-item">
                                <h4>{recipe.name}</h4>

                                {/* Картинка рецепта */}
                                <div className="recipe-image">
                                    <img
                                        src={recipe.image?.image_url || 'https://via.placeholder.com/150'} // Используем картинку, если есть, или заглушку
                                        alt={recipe.name}
                                        className="recipe-thumbnail"
                                    />
                                </div>

                                <p>Cooking time: {recipe.cooking_time || 'N/A'}</p>
                                <p>Products: {recipe.products.map((prod) => prod.name).join(', ')}</p>
                            </div>
                        ))
                    ) : (
                        <p>No partial match recipes found</p>
                    )}
                </div>
            </div>

            {loading && <p>Loading more...</p>}

        </div>
    );
}

export default SearchPage;
