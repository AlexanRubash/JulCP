import React from 'react';
import { useParams } from 'react-router-dom';
import './css/RecipePage.css'; // Добавьте стили для страницы рецепта

const RecipePage = ({ recipes }) => {
    const { id } = useParams(); // Получаем ID рецепта из URL
    const recipe = recipes.find((recipe) => recipe.recipe_id === parseInt(id)); // Ищем рецепт по ID

    if (!recipe) {
        return <p>Recipe not found!</p>;
    }

    return (
        <div className="recipe-page">
            <h1>{recipe.name}</h1>
            <img
                src={recipe.image?.image_url || 'https://via.placeholder.com/300'}
                alt={recipe.name}
                className="recipe-image"
            />
            <p><strong>Description:</strong> {recipe.description}</p>
            <p><strong>Cooking time:</strong> {recipe.cooking_time} minutes</p>

            <h3>Ingredients:</h3>
            <ul>
                {recipe.products.map((product) => (
                    <li key={product.product_id}>
                        {product.name} - {product.quantity}
                    </li>
                ))}
            </ul>

            <h3>Steps:</h3>
            <ol>
                {recipe.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ol>

            <h3>Tags:</h3>
            <p>{recipe.tags.join(', ')}</p>
        </div>
    );
};

export default RecipePage;
