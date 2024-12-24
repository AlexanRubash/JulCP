const recipeRepository = require('./recipe.repository');

// Получение всех данных о рецепте по его id
const fetchRecipeById = async (id, userId) => {
    const recipe = await recipeRepository.getRecipeById(id);
    if (!recipe) return null;

    const products = await recipeRepository.getRecipeProducts(id);
    const tags = await recipeRepository.getRecipeTags(id);
    const image = await recipeRepository.getRecipeImage(id);
    const stepImages = await recipeRepository.getRecipeStepImages(id);

    // Проверяем, находится ли рецепт в избранном у текущего пользователя
    const isFavorite = await recipeRepository.checkIfFavorite(id, userId);

    return {
        ...recipe,
        products,
        tags,
        image,
        stepImages,
        isFavorite, // Добавляем поле isFavorite в ответ
    };
};

// Получение рецептов, которые содержат только указанные продукты
const fetchRecipesByExactProducts = async (productIds) => {
    const recipes = await recipeRepository.getRecipesByExactProducts(productIds);

    return Promise.all(
        recipes.map(async (recipe) => {
            const products = await recipeRepository.getRecipeProducts(recipe.recipe_id);
            const tags = await recipeRepository.getRecipeTags(recipe.recipe_id);
            const image = await recipeRepository.getRecipeImage(recipe.recipe_id);

            return {
                ...recipe,
                products,
                tags,
                image
            };
        })
    );
};

// Получение рецептов по частичному совпадению продуктов
const fetchRecipesByPartialProducts = async (productIds, limit, offset) => {
    const recipes = await recipeRepository.getRecipesByPartialProducts(productIds, limit, offset);

    return Promise.all(
        recipes.map(async (recipe) => {
            const products = await recipeRepository.getRecipeProducts(recipe.recipe_id);
            const tags = await recipeRepository.getRecipeTags(recipe.recipe_id);
            const image = await recipeRepository.getRecipeImage(recipe.recipe_id);

            return {
                ...recipe,
                products,
                tags,
                image
            };
        })
    );
};
// 2. Получение рецептов по имени
const fetchRecipeByName = async (name) => {
    const recipes = await recipeRepository.getRecipeByName(name); // Получаем все рецепты, соответствующие имени

    // Если рецептов нет, возвращаем пустой массив
    if (!recipes.length) return [];

    // Заполнение дополнительной информации для каждого рецепта
    const recipeDetails = await Promise.all(
        recipes.map(async (recipe) => {
            const id = recipe.recipe_id;

            // Получаем дополнительные данные для рецепта
            const products = await recipeRepository.getRecipeProducts(id);
            const tags = await recipeRepository.getRecipeTags(id);
            const image = await recipeRepository.getRecipeImage(id);
            const stepImages = await recipeRepository.getRecipeStepImages(id);  // Изображения шагов

            return {
                ...recipe, // Исходные данные рецепта
                products,  // Продукты для рецепта
                tags,      // Теги рецепта
                image,     // Изображение рецепта
                stepImages // Изображения шагов
            };
        })
    );

    return recipeDetails; // Возвращаем массив рецептов с дополнительной информацией
};

// 3. Получение рецептов по тегу или тегам
const fetchRecipesByTags = async (tags, limit, offset) => {
    // Если tags - это строка, преобразуем ее в массив (если запрос будет с одним тегом)
    if (typeof tags === 'string') {
        tags = [tags];
    }

    // Получение рецептов по тегам
    const recipes = await recipeRepository.getRecipesByTags(tags, limit, offset);

    // Если рецептов нет, возвращаем пустой массив
    if (!recipes.length) return [];

    // Заполнение дополнительной информации о каждом рецепте
    const recipeDetails = await Promise.all(
        recipes.map(async (recipe) => {
            const id = recipe.recipe_id;

            // Получаем дополнительные данные для рецепта
            const products = await recipeRepository.getRecipeProducts(id);
            const tagNames = await recipeRepository.getRecipeTags(id);
            const image = await recipeRepository.getRecipeImage(id);
            const stepImages = await recipeRepository.getRecipeStepImages(id);

            return {
                ...recipe,
                products,
                tags: tagNames, // возвращаем все теги
                image,
                stepImages
            };
        })
    );

    return recipeDetails;
};

// Получение рецептов, которые содержат только указанные продукты (из строки продуктов)
const fetchRecipesByExactProductsFromString = async (products) => {
    const productIds = products.split(',').map(p => p.trim()); // Разделяем строку на массив
    return fetchRecipesByExactProducts(productIds); // Используем существующую функцию
};

// Получение рецептов по частичному совпадению продуктов (из строки продуктов)
const fetchRecipesByPartialProductsFromString = async (products) => {
    const productIds = products.split(',').map(p => p.trim()); // Разделяем строку на массив
    return fetchRecipesByPartialProducts(productIds); // Используем существующую функцию
};
const getProductIdsByNames = async (productNames, limit, offset) => {
    // Вызываем функцию из репозитория для поиска идентификаторов
    return await recipeRepository.findProductIdsByNames(productNames, limit, offset);
};


module.exports = {
    fetchRecipeById,
    fetchRecipesByExactProducts,
    fetchRecipesByPartialProducts,
    fetchRecipesByPartialProductsFromString,
    fetchRecipesByExactProductsFromString,
    getProductIdsByNames,
    fetchRecipeByName,  // Новый метод
    fetchRecipesByTags,
};
