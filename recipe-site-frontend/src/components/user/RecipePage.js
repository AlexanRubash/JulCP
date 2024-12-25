import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FacebookShareButton, TelegramShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TelegramIcon, TwitterIcon, WhatsappIcon } from 'react-share';
import { addFavorite, fetchRecipe, removeFavorite } from '../../api';
import '../css/RecipePage.css';

const RecipePage = ({ token }) => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favoriteMessage, setFavoriteMessage] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);

    const currentUrl = window.location.href; // Текущий URL для кнопки "Поделиться"

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchRecipe(id, token);
                setRecipe(data);
                setIsFavorite(data.isFavorite);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };

        fetchData();
    }, [id, token]);

    const handleToggleFavorite = async () => {
        try {
            let message = '';
            if (isFavorite) {
                message = await removeFavorite(id, token);
                setIsFavorite(false);
            } else {
                message = await addFavorite(id, token);
                setIsFavorite(true);
            }
            setFavoriteMessage(message);
        } catch (err) {
            setFavoriteMessage(err.message);
        }

        setTimeout(() => setFavoriteMessage(''), 3000);
    };

    if (loading) return <p>Loading recipe...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="recipe-page">
            <h1>{recipe.name}</h1>
            <button className="favorite-button" onClick={handleToggleFavorite}>
                {isFavorite ? '💔' : '💖'}
            </button>
            {favoriteMessage && <p className="favorite-message">{favoriteMessage}</p>}

            {recipe.image && recipe.image.image_url && (
                <img src={recipe.image.image_url} alt={recipe.name} className="recipe-image"/>
            )}

            <p>{recipe.description || 'No description available'}</p>
            <p><strong>Cooking Time:</strong> {recipe.cooking_time || 'N/A'} minutes</p>
            <hr></hr>
            <h2>Ingredients</h2>
            <ul>
                {recipe.products?.length > 0
                    ? recipe.products.map((product) => (
                        <li key={product.name}>
                            {product.name} - {product.quantity}
                        </li>
                    ))
                    : <li>No ingredients listed</li>}
            </ul>
            <hr></hr>
            <h2>Steps</h2>
            <ul>
                {recipe.steps?.length > 0
                    ? recipe.steps.map((step, index) => {
                        const stepImage = recipe.stepImages?.find(image => image.step_number === index + 1);
                        return (
                            <li key={index}>
                                <p>Step {index + 1}</p>
                                {stepImage && stepImage.image_data && (
                                    <img
                                        src={stepImage.image_data}
                                        alt={`Step ${index + 1}`}
                                        className="step-image"
                                    />
                                )}
                                <br/>
                                {step}
                            </li>
                        );
                    })
                    : <li>No steps available</li>}
            </ul>
            <hr></hr>
            <h3>Tags</h3>
            <p>{recipe.tags.length > 0 ? recipe.tags.map(tag => tag.name).join(', ') : 'No tags available'}</p>

            {/* Кнопка "Поделиться" */}
            <div className="share-section">
                <h3>Поделиться этим рецептом:</h3>
                <div className="share-buttons">
                    <TelegramShareButton url={currentUrl} title={`Рецепт: ${recipe.name}`}>
                        <TelegramIcon size={32} round/>
                    </TelegramShareButton>
                    <FacebookShareButton url={currentUrl} quote={`Рецепт: ${recipe.name}`}>
                        <FacebookIcon size={32} round/>
                    </FacebookShareButton>
                    <TwitterShareButton url={currentUrl} title={`Рецепт: ${recipe.name}`}>
                        <TwitterIcon size={32} round/>
                    </TwitterShareButton>
                    <WhatsappShareButton url={currentUrl} title={`Рецепт: ${recipe.name}`}>
                        <WhatsappIcon size={32} round/>
                    </WhatsappShareButton>
                </div>
            </div>
        </div>
    );
};

export default RecipePage;
