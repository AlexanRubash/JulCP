import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import '../css/AdminRecipesPage.css'
import {
    fetchRecipeById,
    searchRecipesByName,
    fetchTags,
    searchRecipesByTags,
    fetchProducts, searchPartialRecipes
} from '../../api';
import debounce from "lodash.debounce";
import {adminDeleteRecipe} from "../../api/adminApi";

const AdminRecipesPage = ({ token }) => {
    const [searchType, setSearchType] = useState('id'); // Тип поиска: id, name, tags, products
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchText, setSearchText] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [tagsOptions, setTagsOptions] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [noTagsFound, setNoTagsFound] = useState(false);
    const [ingredientOptions, setIngredientOptions] = useState([]);
    const [noProductsFound, setNoProductsFound] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            switch (searchType) {
                case 'id':
                    navigate(`/recipe/${searchInput}`);
                    break;
                case 'name':
                    const recipesByName = await searchRecipesByName(searchInput, token);
                    setRecipes(recipesByName);
                    break;
                case 'tags':
                    searchByTags();
                    break;
                case 'products':
                    fetchPartialRecipes(1);
                    break;
                default:
                    alert('Выберите способ поиска');
            }
        } catch (err) {
            console.error('Ошибка при поиске:', err);
            alert('Произошла ошибка при поиске');
        }
    };
    const fetchPartialRecipes = async (page) => {
        if (!hasMore) return; // Если новых рецептов нет, не загружаем

        setLoading(true);
        try {
            const searchString = searchText.map((item) => item.label).join(', '); // Преобразуем в строку для поиска
            const foundRecipes = await searchPartialRecipes(searchString, token, 10, page * 10);
            console.log(foundRecipes);
            if (foundRecipes.length === 0) {
                setHasMore(false); // Если рецептов нет, больше не подгружаем
            } else {
                setRecipes((prev) => [...prev, ...foundRecipes]);
                setPage(page + 1); // Увеличиваем номер страницы
            }
        } catch (err) {
            setError('Failed to fetch partial recipes');
        }
        setLoading(false);
    };

    const handleTagsSearch = debounce(async (inputValue) => {
        if (!inputValue.trim()) {
            setTagsOptions([]); // Очистка списка при пустом вводе
            setNoTagsFound(false); // Скрыть сообщение о том, что теги не найдены
            return;
        }
        await fetchTagsOptions(inputValue); // Запрос тегов
    }, 300);
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
    const handleIngredientsChange = (selectedOptions) => {
        setSearchText(selectedOptions); // Обновляем список выбранных ингредиентов
        if (selectedOptions && selectedOptions.length) {
            const lastInput = selectedOptions[selectedOptions.length - 1]?.label || '';
            handleIngredientsSearch(lastInput); // Пробуем продолжить поиск по последнему введенному элементу
        }
    };
    const searchByTags = async () => {
        setLoading(true);
        setRecipes([]); // Очищаем рецепты перед новым поиском
        setError(''); // Очищаем ошибку
        setPage(1); // Сбрасываем номер страницы
        setHasMore(true); // Разрешаем подгрузку
        if (selectedTags.length === 0) {
            setError('Выберите хотя бы один тег');
            setLoading(false);
            return;
        }

        try {
            const tagNames = selectedTags.map(tag => tag.value); // Получаем ids выбранных тегов
            const foundRecipes = await searchRecipesByTags(tagNames, token, 10, 0); // Поиск с пагинацией
            setRecipes(foundRecipes);
        } catch (err) {
            console.error('Error searching recipes by tags:', err);
            setError('Failed to fetch recipes');
        }
        setLoading(false);
    };

    const fetchTagsOptions = async (inputValue) => {
        try {
            const tags = await fetchTags(inputValue, token);
            const options = tags.map(tag => ({
                value: tag.name,
                label: tag.name,
            }));
            setTagsOptions(options);
        } catch (err) {
            console.error('Ошибка загрузки тегов:', err);
        }
    };
    const handleTagsChange = (selectedOptions) => {
        setSelectedTags(selectedOptions || []); // Обновляем список выбранных тегов
        if (selectedOptions && selectedOptions.length) {
            const lastInput = selectedOptions[selectedOptions.length - 1]?.label || '';
            handleTagsSearch(lastInput); // Пробуем продолжить поиск по последнему введенному тегу
        }
    };
    const loadMoreRecipes = async () => {
        if (loading || !hasMore) return; // Если уже загружаются данные или больше нет рецептов
        setLoading(true);

        try {
            let newRecipes = [];
            const newPage = page + 1;

            switch (searchType) {
                case 'tags': {
                    const tagNames = selectedTags.map(tag => tag.value);
                    newRecipes = await searchRecipesByTags(tagNames, token, 10, newPage * 10);
                    break;
                }
                case 'products': {
                    const searchString = searchText.map((item) => item.label).join(', ');
                    newRecipes = await searchPartialRecipes(searchString, token, 10, newPage * 10);
                    break;
                }
                default: {
                    console.error('Load more is only supported for search by tags or products.');
                    setLoading(false);
                    return;
                }
            }

            if (newRecipes.length < 10) {
                setHasMore(false); // Если рецептов меньше, чем лимит, больше не загружать
            }
            setRecipes(prev => [...prev, ...newRecipes]); // Добавляем новые рецепты
            setPage(newPage); // Обновляем номер страницы
        } catch (err) {
            console.error('Error loading more recipes:', err);
        }
        setLoading(false);
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
            alert(`Рецепт ${recipeToDelete.recipe_id}, ${recipeToDelete.name} удален`);
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

    return (
        <div className="admin-recipe-page">
            <h2>Админ. Панель</h2>
            <div className="view-switcher">

                <button
                    onClick={() => navigate('/admin/create-recipe')}
                >
                    Создать Рецепт
                </button>
            </div>
             <>
                    <div className="search-options">
                        <label>
                            <input
                                type="radio"
                                name="searchType"
                                value="id"
                                checked={searchType === 'id'}
                                onChange={() => setSearchType('id')}
                            />
                            Поиск по ID
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="searchType"
                                value="name"
                                checked={searchType === 'name'}
                                onChange={() => setSearchType('name')}
                            />
                            Поиск по Имени
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="searchType"
                                value="tags"
                                checked={searchType === 'tags'}
                                onChange={() => setSearchType('tags')}
                            />
                            Поиск по Тегам
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="searchType"
                                value="products"
                                checked={searchType === 'products'}
                                onChange={() => setSearchType('products')}
                            />
                            Поиск по Продуктам
                        </label>
                    </div>

                    <div className="search-input">
                        {searchType === 'id' && (
                            <input
                                type="text"
                                placeholder="Введите ID рецепта"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        )}
                        {searchType === 'name' && (
                            <input
                                type="text"
                                placeholder="Введите имя рецепта"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        )}
                        {searchType === 'tags' && (
                            <Select
                                isMulti
                                value={selectedTags}
                                onChange={handleTagsChange}
                                options={tagsOptions}
                                onInputChange={handleTagsSearch}
                                isLoading={isLoadingOptions}
                                placeholder="Выберите теги"
                                noOptionsMessage={() => noTagsFound ? 'Теги не найдены' : 'Нет тегов для поиска'}
                                getOptionLabel={(e) => e.label}
                                getOptionValue={(e) => e.value}
                            />
                        )}
                        {searchType === 'products' && (
                            <Select
                                isMulti
                                value={searchText}
                                onChange={handleIngredientsChange}
                                options={ingredientOptions}
                                onInputChange={handleIngredientsSearch}
                                isLoading={isLoadingOptions}
                                placeholder="Выберите ингредиенты"
                                noOptionsMessage={() => noProductsFound ? 'Продукты не найдены' : 'Нет ингредиентов'}
                                getOptionLabel={(e) => e.label}
                                getOptionValue={(e) => e.value}
                            />
                        )}
                    </div>

                    <button className="search-button" onClick={handleSearch}>
                        Искать
                    </button>

                    <div className="recipe-list">
                        <div className="recipe-list">
                            <h3>Результаты поиска</h3>
                            <div className="recipe-grid">
                                {recipes.length > 0 ? (
                                    recipes.map((recipe) => (
                                        <div key={recipe.recipe_id} className="recipe-item">
                                            <h4>{recipe.name}</h4>
                                            <h6>Recipe id: {recipe.recipe_id}</h6>
                                            <div className="recipe-image">
                                                <img
                                                    src={recipe.image ? recipe.image.image_url : 'https://via.placeholder.com/150'}
                                                    alt={recipe.name}
                                                    className="recipe-thumbnail"
                                                />
                                            </div>
                                            <p>Теги: {recipe.tags?.map(tag => tag.name).join(', ') || 'Нет тегов'}</p>
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
                                    ))
                                ) : (
                                    <p>Нет результатов</p>
                                )}
                            </div>
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
                    </div>
                    {hasMore && !loading && (
                        <button className="load-more" onClick={loadMoreRecipes}>Загрузить ещё</button>
                    )}
                </>
            )
        </div>
    );
};

export default AdminRecipesPage;
