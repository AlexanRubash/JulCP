import React, { useState, useEffect, useRef } from 'react';
import {searchPartialRecipes, fetchProducts, searchRecipesByTags, searchExactRecipes} from '../../api'; // Импортируем функции для поиска
import Select from 'react-select';
import { jwtDecode } from 'jwt-decode';
import '../css/RecipeItem.css';
import debounce from 'lodash.debounce';

const SearchPage = ({ token }) => {
    const [searchText, setSearchText] = useState([]); // Множество ингредиентов
    const [exactRecipes, setExactRecipes] = useState([]); // Список точных рецептов
    const [partialRecipes, setPartialRecipes] = useState([]); // Список частичных рецептов
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [ingredientOptions, setIngredientOptions] = useState([]); // Опции для react-select
    const [isLoadingOptions, setIsLoadingOptions] = useState(false); // Загрузка опций
    const [error, setError] = useState(''); // Ошибка
    const [noProductsFound, setNoProductsFound] = useState(false); // Стейт для отображения сообщения об отсутствии продуктов
    const [page, setPage] = useState(1); // Текущая страница для пагинации
    const [hasMore, setHasMore] = useState(true); // Флаг для проверки, есть ли еще рецепты

    const scrollRef = useRef(null); // Ссылка на элемент для отслеживания прокрутки

    // Дебаунс обработчика ввода
    const handleIngredientsSearch = debounce(async (inputValue) => {
        if (!inputValue.trim()) {
            setIngredientOptions([]); // Очистка списка при пустом вводе
            setNoProductsFound(false); // Скрыть сообщение о том, что продуктов не найдено
            return;
        }
        await fetchIngredientOptions(inputValue); // Запрос продуктов
    }, 300);

    // Получение опций для react-select (список ингредиентов)
    const fetchIngredientOptions = async (inputValue) => {
        try {
            setIsLoadingOptions(true); // Включаем индикатор загрузки
            const products = await fetchProducts(inputValue, token); // Подключаем API для получения продуктов

            if (products.length === 0) {
                setNoProductsFound(true); // Устанавливаем флаг, что продукты не найдены
            } else {
                setNoProductsFound(false); // Продукты найдены, скрываем сообщение
            }

            const options = products.map((product) => ({
                value: product.product_id, // Используйте product_id вместо id
                label: product.name,
            }));
            setIngredientOptions(options); // Обновляем список опций
        } catch (err) {
            console.error('Failed to fetch ingredient options:', err);
            setError('Failed to fetch ingredient options'); // Ошибка при запросе продуктов
        } finally {
            setIsLoadingOptions(false); // Выключаем индикатор загрузки
        }
    };

    useEffect(() => {
        // Если при первом запуске страницы продуктов нет, их можно загрузить
        fetchIngredientOptions('');
    }, [token]);

    // Обработчик изменения выбранных ингредиентов
    const handleIngredientsChange = (selectedOptions) => {
        setSearchText(selectedOptions); // Обновляем список выбранных ингредиентов
        if (selectedOptions && selectedOptions.length) {
            const lastInput = selectedOptions[selectedOptions.length - 1]?.label || '';
            handleIngredientsSearch(lastInput); // Пробуем продолжить поиск по последнему введенному элементу
        }
    };

    // Обработчик отправки формы
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (searchText.length === 0) {
            setError('Выберите хотя бы один ингредиент');
            return;
        }
        setExactRecipes([]); // Очищаем точные рецепты при новом поиске
        setPartialRecipes([]); // Очищаем частичные рецепты при новом поиске
        await fetchExactRecipes(1); // Получаем точные рецепты
        await fetchPartialRecipes(1); // Получаем частичные рецепты
    };

    // Получение точных рецептов
    const fetchExactRecipes = async (page) => {
        setLoading(true);
        try {
            const searchString = searchText.map((item) => item.label).join(', '); // Преобразуем в строку для поиска
            const decodedToken = jwtDecode(token); // Декодируем токен

            const foundRecipes = await searchExactRecipes(searchString, token);

            // Фильтруем рецепты: оставляем только глобальные или созданные пользователем
            const filteredRecipes = foundRecipes.filter(
                (recipe) => recipe.is_global || recipe.created_by === decodedToken.user_id
            );

            setExactRecipes(filteredRecipes);
        } catch (err) {
            setError('Failed to fetch exact recipes');
        }
        setLoading(false);
    };

    // Получение частичных рецептов с пагинацией
    const fetchPartialRecipes = async (page) => {
        if (!hasMore) return; // Если новых рецептов нет, не загружаем

        setLoading(true);
        try {
            const searchString = searchText.map((item) => item.label).join(', '); // Преобразуем в строку для поиска
            const foundRecipes = await searchPartialRecipes(searchString, token, 10, page * 10);

            if (foundRecipes.length === 0) {
                setHasMore(false); // Если рецептов нет, больше не подгружаем
            } else {
                setPartialRecipes((prev) => [...prev, ...foundRecipes]);
                setPage(page + 1); // Увеличиваем номер страницы
            }
        } catch (err) {
            setError('Failed to fetch partial recipes');
        }
        setLoading(false);
    };

    // Обработчик клика на кнопку "Загрузить еще"
    const loadMoreRecipes = async () => {
        if (loading || !hasMore) return; // Если уже загружаются данные или больше нет рецептов
        setLoading(true);

        const searchString = searchText.map((item) => item.label).join(', '); // Преобразуем в строку для поиска
        const newPage = page + 1;
        try {
            const newRecipes = await searchPartialRecipes(searchString, token, 10, newPage * 10); // Подгружаем рецепты
            if (newRecipes.length < 10) {
                setHasMore(false); // Если рецептов меньше, чем лимит, больше не загружать
            }
            setPartialRecipes(prev => [...prev, ...newRecipes]); // Добавляем новые рецепты
            setPage(newPage); // Обновляем номер страницы
        } catch (err) {
            console.error('Error loading more recipes:', err);
        }
        setLoading(false);
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSearchSubmit}>
                <h2>Поиск рецепта</h2>
                <Select
                    isMulti
                    value={searchText}
                    onChange={handleIngredientsChange}
                    options={ingredientOptions}
                    onInputChange={handleIngredientsSearch}
                    isLoading={isLoadingOptions}
                    placeholder="Выберите ингредиенты"
                    noOptionsMessage={() => {
                        if (isLoadingOptions) return 'Загрузка...';
                        return noProductsFound ? 'Продукты не найдены' : 'Нет ингредиентов';
                    }}
                    getOptionLabel={(e) => e.label}
                    getOptionValue={(e) => e.value}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Поиск...' : 'Поиск'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {/* Точные рецепты */}
            <div className="recipe-list exact-recipes">
                <h3>Точное совпадение</h3>
                <div className="recipe-grid">
                    {exactRecipes.length > 0 ? (
                        exactRecipes.map((recipe) => (
                            <div key={recipe.recipe_id} className="recipe-item">
                                <div className="recipe-image">
                                    <img
                                        src={recipe.image?.image_url || 'https://via.placeholder.com/150'}
                                        alt={recipe.name}
                                        className="recipe-thumbnail"
                                    />
                                </div>
                                <h4>{recipe.name}</h4>
                                <div className="recipe-wrapper"></div>
                                <p>Products: <span>{recipe.products.map((prod) => prod.name).join(', ')}</span> </p>
                                <p>Cooking time: <span>{recipe.cooking_time || 'N/A'}</span></p>
                                {/* Заменили Link на кнопку */}

                                <a href={`/recipe/${recipe.recipe_id}`} className="details-button">
                                    <div className="button-container">
                                        <p>Подробнее</p>
                                    </div>
                                </a>
                            </div>
                        ))
                    ) : (
                        <p>No exact match recipes found</p>
                    )}
                </div>
            </div>

            {/* Частичные рецепты */}
            <div className="recipe-list partial-recipes" ref={scrollRef}>
                <h3>Partial Match Recipes</h3>
                <div className="recipe-grid">
                    {partialRecipes.length > 0 ? (
                        partialRecipes.map((recipe) => (
                            <div key={recipe.recipe_id} className="recipe-item">
                                <h4>{recipe.name}</h4>
                                <div className="recipe-image">
                                    <img
                                        src={recipe.image?.image_url || 'https://via.placeholder.com/150'}
                                        alt={recipe.name}
                                        className="recipe-thumbnail"
                                    />
                                </div>
                                <p>Cooking time: {recipe.cooking_time || 'N/A'}</p>
                                <p>Products: {recipe.products.map((prod) => prod.name).join(', ')}</p>
                                {/* Заменили Link на кнопку */}
                                <a href={`/recipe/${recipe.recipe_id}`} className="details-button">
                                    <div className="button-container">
                                        <p>Подробнее</p>
                                    </div>
                                </a>
                            </div>
                        ))
                    ) : (
                        <p>No partial match recipes found</p>
                    )}
                </div>
            </div>

            {/* Кнопка загрузки еще рецептов */}
            {hasMore && !loading && (
                <button className="load-more" onClick={loadMoreRecipes}>
                    Загрузить еще
                </button>
            )}

            {loading && <p>Loading more...</p>}
        </div>
    );
};

export default SearchPage;
