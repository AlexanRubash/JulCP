const recipeRepository = require('./recipe.repository');

// Получение всех данных о рецепте по его id
const fetchRecipeById = async (id) => {
    const recipe = await recipeRepository.getRecipeById(id);
    if (!recipe) return null;

    const products = await recipeRepository.getRecipeProducts(id);
    const tags = await recipeRepository.getRecipeTags(id);
    const image = await recipeRepository.getRecipeImage(id);

    return {
        ...recipe,
        products,
        tags,
        image
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
const fetchRecipesByPartialProducts = async (productIds) => {
    const recipes = await recipeRepository.getRecipesByPartialProducts(productIds);

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
const getProductIdsByNames = async (productNames) => {
    // Вызываем функцию из репозитория для поиска идентификаторов
    return await recipeRepository.findProductIdsByNames(productNames);
};


module.exports = {
    fetchRecipeById,
    fetchRecipesByExactProducts,
    fetchRecipesByPartialProducts,
    fetchRecipesByPartialProductsFromString,
    fetchRecipesByExactProductsFromString,
    getProductIdsByNames
};
