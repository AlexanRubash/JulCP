import React, { useState, useEffect } from 'react';
import { fetchProductById, fetchRecipesByProductId } from '../../api/product'; // Функции для получения информации о продукте и рецептов
import { useParams } from 'react-router-dom'; // Для получения ID продукта из URL
import {jwtDecode} from 'jwt-decode';
import '../css/SearchPage.css';

const ProductPage = ({ token }) => {
    const { productId } = useParams(); // Получаем ID продукта из URL
    const [product, setProduct] = useState(null); // Состояние для хранения информации о продукте
    const [recipes, setRecipes] = useState([]); // Состояние для хранения рецептов
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [error, setError] = useState(null); // Ошибка загрузки

    // Расшифровываем токен для получения роли пользователя
    let userRole = '';
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            userRole = decodedToken.role; // Предполагается, что в токене есть поле `role`
        } catch (err) {
            console.error('Failed to decode token:', err);
        }
    }

    const isAdmin = userRole === 'admin'; // Проверка, является ли пользователь администратором

    // Функция для загрузки информации о продукте по ID
    const loadProduct = async (productId) => {
        try {
            const data = await fetchProductById(productId, token);
            setProduct(data);
        } catch (err) {
            setError('Failed to load product details');
        }
    };

    // Функция для загрузки рецептов с этим продуктом
    const loadRecipes = async (productId) => {
        try {
            const data = await fetchRecipesByProductId(productId, token);
            setRecipes(data);
        } catch (err) {
            setError('Failed to load recipes');
        }
    };

    // Функция для удаления рецепта
    const handleDeleteClick = async (recipe) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete the recipe "${recipe.name}"?`);
        if (confirmDelete) {
            try {
                // Здесь должен быть вызов API для удаления рецепта
                console.log(`Deleting recipe ID: ${recipe.recipe_id}`);
                // После успешного удаления обновляем список рецептов
                setRecipes((prevRecipes) => prevRecipes.filter((r) => r.recipe_id !== recipe.recipe_id));
            } catch (err) {
                console.error('Failed to delete recipe:', err);
            }
        }
    };

    // Эффект для загрузки данных при монтировании компонента
    useEffect(() => {
        setLoading(true); // Начинаем загрузку
        loadProduct(productId); // Загружаем продукт
        loadRecipes(productId); // Загружаем рецепты с этим продуктом
        setLoading(false); // Останавливаем загрузку
    }, [productId, token]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="product-page">
            {error && <p className="error">{error}</p>}

            {product && (
                <div className="product-details">
                    <h1>{product.name}</h1>
                    <p><strong>ID:</strong> {product.product_id}</p>
                    <p><strong>Description:</strong> {product.description}</p>
                </div>
            )}

            <div className="recipes-section">
                <h2>Recipes with this product</h2>
                {recipes.length > 0 ? (
                    <div className="recipe-list">
                        {recipes.map((recipe) => (
                            <div key={recipe.recipe_id} className="recipe-item">
                                <h3>{recipe.name}</h3>
                                <p>Cooking Time: {recipe.cooking_time || 'N/A'}</p>
                                <p>{recipe.description}</p>
                                <a href={`/recipe/${recipe.recipe_id}`} className="details-button">
                                    <div className="button-container">
                                        <p>Подробнее</p>
                                    </div>
                                </a>
                                {isAdmin && (
                                    <div>
                                        <a href={`/admin/update-recipe/${recipe.recipe_id}`} className="details-button">
                                            Изменить
                                        </a>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteClick(recipe)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No recipes found with this product.</p>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
