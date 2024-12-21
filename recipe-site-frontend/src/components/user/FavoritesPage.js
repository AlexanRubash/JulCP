import React, { useState, useEffect } from 'react';
import { fetchFavorites } from '../../api'; // Импортируем функцию из api.js
import '../css/RecipeItem.css'; // Стили для отображения рецептов

const FavoritesPage = ({ token, onNavigate }) => {
    const [favorites, setFavorites] = useState([]); // Список избранных рецептов
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(''); // Ошибка

    useEffect(() => {
        // Получение избранных рецептов
        const loadFavorites = async () => {
            try {
                const data = await fetchFavorites(token); // Используем функцию из api.js
                setFavorites(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [token]);

    if (loading) return <p>Loading favorites...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleViewDetails = (recipeId) => {
        // Передаем recipeId для отображения страницы деталей рецепта
        onNavigate(`recipe/${recipeId}`);
    };

    return (
        <div className="favorites-container">
            <h2>My Favorite Recipes</h2>
            <div className="recipe-grid">
                {favorites.length > 0 ? (
                    favorites.map((recipe) => (
                        <div key={recipe.recipe_id} className="recipe-item">
                            <h4>{recipe.name}</h4>

                            {/* Картинка рецепта */}
                            <div className="recipe-image">
                                <img
                                    src={recipe.image_url || 'https://via.placeholder.com/150'}
                                    alt={recipe.name}
                                    className="recipe-thumbnail"
                                />
                            </div>

                            <p>{recipe.description}</p>
                            <p>Cooking time: {recipe.cooking_time} minutes</p>

                            {/* Заменяем Link на кнопку */}
                            <button
                                className="details-button"
                                onClick={() => handleViewDetails(recipe.recipe_id)}
                            >
                                View Details
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No favorite recipes found.</p>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
