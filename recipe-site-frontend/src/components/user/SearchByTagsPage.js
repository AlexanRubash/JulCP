import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchTags, searchRecipesByTags } from '../../api'; // Функции для получения тегов и поиска рецептов
import { jwtDecode } from 'jwt-decode';
import debounce from 'lodash.debounce';
import '../css/SearchPage.css';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate

const SearchByTagsPage = ({ token }) => {
    const [selectedTags, setSelectedTags] = useState([]); // Выбранные теги
    const [tagsOptions, setTagsOptions] = useState([]); // Опции для react-select
    const [recipes, setRecipes] = useState([]); // Список рецептов
    const [loading, setLoading] = useState(false); // Состояние загрузки
    const [error, setError] = useState(''); // Ошибка
    const [isLoadingOptions, setIsLoadingOptions] = useState(false); // Индикатор загрузки тегов
    const [noTagsFound, setNoTagsFound] = useState(false); // Стейт для отображения сообщения об отсутствии тегов

    const [page, setPage] = useState(1); // Номер страницы для пагинации
    const [hasMore, setHasMore] = useState(true); // Стейт для проверки наличия следующих рецептов

    const navigate = useNavigate(); // Хук для навигации

    // Дебаунс обработчика ввода
    const handleTagsSearch = debounce(async (inputValue) => {
        if (!inputValue.trim()) {
            setTagsOptions([]); // Очистка списка при пустом вводе
            setNoTagsFound(false); // Скрыть сообщение о том, что теги не найдены
            return;
        }
        await fetchTagsOptions(inputValue); // Запрос тегов
    }, 300);

    // Получение опций для react-select (список тегов)
    const fetchTagsOptions = async (inputValue) => {
        try {
            setIsLoadingOptions(true); // Включаем индикатор загрузки
            const tags = await fetchTags(inputValue, token); // Запрашиваем теги с сервера

            if (tags.length === 0) {
                setNoTagsFound(true); // Устанавливаем флаг, что теги не найдены
            } else {
                setNoTagsFound(false); // Теги найдены, скрываем сообщение
            }

            const options = tags.map((tag) => ({
                value: tag.name, // Используем id тега как value
                label: tag.name, // Используем название тега как label
            }));
            setTagsOptions(options); // Обновляем список опций
        } catch (err) {
            console.error('Failed to fetch tag options:', err);
            setError('Failed to fetch tag options'); // Ошибка при запросе тегов
        } finally {
            setIsLoadingOptions(false); // Выключаем индикатор загрузки
        }
    };

    useEffect(() => {
        // Загружаем теги при монтировании компонента
        fetchTagsOptions('');
    }, [token]);

    // Обработчик изменения выбранных тегов
    const handleTagsChange = (selectedOptions) => {
        setSelectedTags(selectedOptions || []); // Обновляем список выбранных тегов
        if (selectedOptions && selectedOptions.length) {
            const lastInput = selectedOptions[selectedOptions.length - 1]?.label || '';
            handleTagsSearch(lastInput); // Пробуем продолжить поиск по последнему введенному тегу
        }
    };

    // Функция для поиска рецептов по выбранным тегам
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

    // Функция для подгрузки дополнительных рецептов
    const loadMoreRecipes = async () => {
        if (loading || !hasMore) return; // Если уже загружаются данные или больше нет рецептов
        setLoading(true);

        const tagNames = selectedTags.map(tag => tag.value); // Получаем ids выбранных тегов
        const newPage = page + 1;
        try {
            const newRecipes = await searchRecipesByTags(tagNames, token, 10, newPage * 10); // Подгружаем рецепты
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

    return (
        <div className="search-container">
            <h2>Поиск рецептов по тегам</h2>
            <div className="tags-search-form">
                <Select
                    isMulti
                    value={selectedTags}
                    onChange={handleTagsChange} // Обработка изменений
                    options={tagsOptions}
                    onInputChange={handleTagsSearch} // Обработка ввода
                    isLoading={isLoadingOptions}
                    placeholder="Выберите теги"
                    noOptionsMessage={() => {
                        if (isLoadingOptions) return 'Загрузка...';
                        return noTagsFound ? 'Теги не найдены' : 'Нет тегов для поиска';
                    }}
                    getOptionLabel={(e) => e.label}
                    getOptionValue={(e) => e.value}
                />
                <button onClick={searchByTags} disabled={loading}>
                    {loading ? 'Поиск...' : 'Поиск'}
                </button>
            </div>

            {error && <p className="error">{error}</p>}

            {/* Результаты поиска */}
            <div className="recipe-list">
                {loading && <p>Загрузка...</p>}
                {recipes.length > 0 ? (
                    <div className="recipe-grid">
                        {recipes.map((recipe) => (
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
                                {recipe.description && (
                                    <p>
                                        Description: {recipe.description.length > 100 ? recipe.description.slice(0, 100) + '...' : recipe.description}
                                    </p>
                                )}
                                {/* Ограничение на количество тегов */}
                                <p>
                                    Tags: {recipe.tags.length > 5 ? recipe.tags.slice(0, 5).map(tag => tag.name).join(', ') + '...' : recipe.tags.map(tag => tag.name).join(', ')}
                                </p>
                                {/* Заменили Link на onClick для использования navigate */}
                                <button
                                    className="details-button"
                                    onClick={() => navigate(`/recipe/${recipe.recipe_id}`)}
                                >
                                    Подробнее
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Рецепты не найдены</p>
                )}
            </div>
            {hasMore && !loading && (
                <button className="load-more" onClick={loadMoreRecipes}>Загрузить ещё</button>
            )}
        </div>
    );
};

export default SearchByTagsPage;
