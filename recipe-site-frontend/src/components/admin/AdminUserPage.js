import React, { useState, useEffect } from 'react';
import {adminDeleteRecipe, fetchUserById, fetchUserRecipesAndProducts} from '../../api/adminApi'; // Импортируем необходимые API-функции
import { useParams } from 'react-router-dom'; // Для получения ID пользователя из URL

const AdminUserPage = ({ token }) => {
    const { userId } = useParams(); // Получаем ID пользователя из URL
    const [user, setUser] = useState(null); // Состояние для хранения информации о пользователе
    const [recipes, setRecipes] = useState([]); // Состояние для хранения рецептов пользователя
    const [products, setProducts] = useState([]); // Состояние для хранения продуктов пользователя
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Ошибка загрузки
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    // Функция для загрузки информации о пользователе
    const loadUser = async (userId) => {
        try {
            const data = await fetchUserById(userId, token);
            // Если API возвращает массив, извлекаем первый элемент
            if (Array.isArray(data)) {
                setUser(data[0]); // Извлекаем первый элемент массива
            } else {
                setUser(data); // Если это уже объект, просто устанавливаем его
            }
        } catch (err) {
            setError('Не удалось загрузить информацию о пользователе');
        }
    };

    const handleDeleteClick = (recipe) => {
        setRecipeToDelete(recipe);
        setShowDeleteConfirm(true);
    };
    const handleDeleteConfirm = async () => {
        if (!recipeToDelete) return;

        try {
            await adminDeleteRecipe(recipeToDelete.recipe_id, token);
            setRecipes(recipes.filter(r => r.recipe_id !== recipeToDelete.recipe_id)); // Удаляем из списка
        } catch (error) {
            console.error('Ошибка удаления рецепта:', error);
            alert('Не удалось удалить рецепт');
        } finally {
            setShowDeleteConfirm(false);
            setRecipeToDelete(null);
        }
    };
    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setRecipeToDelete(null);
    };

    // Функция для загрузки рецептов и продуктов пользователя
    const loadRecipesAndProducts = async (userId) => {
        try {
            const data = await fetchUserRecipesAndProducts(userId, token);
            setRecipes(data.recipes || []); // Предположим, что рецепты приходят в data.recipes
            setProducts(data.products || []); // И продукты в data.products
        } catch (err) {
            setError('Не удалось загрузить рецепты и продукты пользователя');
        }
    };

    // Эффект для загрузки данных при монтировании компонента
    useEffect(() => {
        setLoading(true); // Начинаем загрузку
        loadUser(userId); // Загружаем пользователя
        loadRecipesAndProducts(userId); // Загружаем рецепты и продукты
        setLoading(false); // Останавливаем загрузку
    }, [userId, token]);

    // Эффект для отслеживания изменений в user
    useEffect(() => {
        if (user) {
            console.log('users', user); // Теперь user будет обновляться корректно
            console.log('recipes', recipes);
        }
    }, [user]); // Этот useEffect будет срабатывать каждый раз, когда user изменится

    if (loading) return <p>Загрузка...</p>;

    return (
        <div className="user-page">
            {error && <p className="error">{error}</p>}

            {user && (
                <div className="user-details">
                    <h1>{user.username}</h1>
                    <p><strong>Роль:</strong> {user.role}</p>
                    <p><strong>ID:</strong> {user.user_id}</p>
                </div>
            )}

            <div className="user-content">
                {/* Раздел с рецептами пользователя */}
                <div className="recipes-section">
                    <h2>Рецепты пользователя</h2>
                    {recipes.length > 0 ? (
                        <div className="recipe-list">
                            {recipes.map((recipe) => (
                                <div key={recipe.recipe_id} className="recipe-item">
                                    <h3>{recipe.recipe_name}</h3>
                                    <p>{recipe.recipe_id}</p>
                                    <div className="recipe-image">
                                        <img
                                            src={recipe.image ? recipe.image.image_url : 'https://via.placeholder.com/150'}
                                            alt={recipe.name}
                                            className="recipe-thumbnail"
                                        />
                                    </div>
                                    <p>Время готовки: {recipe.cooking_time || 'N/A'}</p>
                                    <p>{recipe.description}</p>
                                    <a href={`/recipe/${recipe.recipe_id}`} className="details-button">
                                        <div className="button-container">
                                            <p>Подробнее</p>
                                        </div>
                                    </a>
                                    <a href={`/admin/update-recipe/${recipe.recipe_id}`}
                                       className="details-button">
                                        <div className="button-container">
                                            <p>Изменить</p>
                                        </div>
                                    </a>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteClick(recipe)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Рецепты не найдены.</p>
                    )}
                </div>
                {showDeleteConfirm && (
                    <div className="delete-confirm-modal">
                        <div className="modal-content">
                            <p>
                                Вы уверены, что хотите удалить
                                рецепт {recipeToDelete.recipe_id}, {recipeToDelete.name}?
                            </p>
                            <button className="confirm-button" onClick={handleDeleteConfirm}>
                                Да, удалить
                            </button>
                            <button className="cancel-button" onClick={handleDeleteCancel}>
                                Отмена
                            </button>
                        </div>
                    </div>
                )}
                {/* Раздел с продуктами пользователя */}
                <div className="products-section">
                    <h2>Продукты пользователя</h2>
                    {products.length > 0 ? (
                        <div className="product-list">
                            {products.map((product) => (
                                <div key={product.product_id} className="product-item">
                                <h3>{product.name}</h3>
                                    <p>ID: {product.product_id}</p>
                                    <p>{product.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Продукты не найдены.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUserPage;
