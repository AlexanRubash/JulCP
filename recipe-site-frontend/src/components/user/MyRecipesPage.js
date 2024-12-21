import React, { useState, useEffect } from 'react';
import '../css/RecipeItem.css';

const MyRecipesPage = ({ token, onNavigate }) => {
    const [myRecipes, setMyRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMyRecipes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users/recipes', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch your recipes');
                }

                const data = await response.json();
                setMyRecipes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyRecipes();
    }, [token]);

    if (loading) return <p>Loading your recipes...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleViewDetails = (recipeId) => {
        // Передаем recipeId в родительский компонент для отображения подробностей рецепта
        onNavigate(`recipe/${recipeId}`);
    };

    const handleUpdateRecipe = (recipeId) => {
        // Передаем recipeId в родительский компонент для обновления рецепта
        onNavigate(`update-recipe/${recipeId}`);
    };

    return (
        <div className="my-recipes-container">
            <h2>My Recipes</h2>
            <div className="recipe-grid">
                {myRecipes.length > 0 ? (
                    myRecipes.map((recipe) => (
                        <div key={recipe.recipe_id} className="recipe-item">
                            <h4>{recipe.name}</h4>
                            <div className="recipe-image">
                                <img
                                    src={recipe.image_url || 'https://via.placeholder.com/150'}
                                    alt={recipe.name}
                                    className="recipe-thumbnail"
                                />
                            </div>
                            <p>{recipe.description}</p>
                            <p>Cooking time: {recipe.cooking_time} minutes</p>
                            <div className="recipe-actions">
                                <button
                                    className="details-button"
                                    onClick={() => handleViewDetails(recipe.recipe_id)}
                                >
                                    View Details
                                </button>
                                <button
                                    className="update-button"
                                    onClick={() => handleUpdateRecipe(recipe.recipe_id)}
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No recipes found.</p>
                )}
            </div>
        </div>
    );
};

export default MyRecipesPage;
