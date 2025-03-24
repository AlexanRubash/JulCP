const recipeService = require('./recipe.service');

// 1. Получение всех данных о рецепте по его id
const getRecipeById = async (req, res) => {
    const { id } = req.params;
    const userId =req.user.user_id;
    try {
        const recipe = await recipeService.fetchRecipeById(id, userId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Получение рецептов, которые содержат указанные продукты
const getRecipesByExactProducts = async (req, res) => {
    const { product_ids: productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ message: 'Invalid input: productIds must be an array' });
    }

    try {
        const recipes = await recipeService.fetchRecipesByExactProducts(productIds);
        if (!recipes.length) {
            return res.status(404).json({ message: 'No recipes found' });
        }
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 3. Получение рецептов по частичному совпадению продуктов
const getRecipesByPartialProducts = async (req, res) => {
    const { product_ids: productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ message: 'Invalid input: productIds must be an array' });
    }

    try {
        const recipes = await recipeService.fetchRecipesByPartialProducts(productIds);
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getRecipesByExactProductsFromString = async (req, res) => {
    const { products } = req.body; // Получаем строку продуктов
    if (!products || typeof products !== 'string') {
        return res.status(400).json({ message: 'Invalid input: products must be a string' });
    }

    try {
        // Разделяем строку на массив строк
        const productNames = products.split(',').map(name => name.trim());

        // Ищем product_ids по названию продуктов
        const productIds = await recipeService.getProductIdsByNames(productNames);
        if (!productIds.length) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Используем существующую логику для поиска рецептов
        const recipes = await recipeService.fetchRecipesByExactProducts(productIds);
        if (!recipes.length) {
            return res.status(404).json({ message: 'No recipes found' });
        }

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// 3. Получение рецептов по частичному совпадению продуктов (список продуктов через запятую)
const getRecipesByPartialProductsFromString = async (req, res) => {
    const { products } = req.body; // Получаем строку продуктов
    const limit = req.body.limit;
    const offset = req.body.offset;
    if (!products || typeof products !== 'string') {
        return res.status(400).json({ message: 'Invalid input: products must be a string' });
    }

    try {
        // Разделяем строку на массив строк
        const productNames = products.split(',').map(name => name.trim());

        // Ищем product_ids по названию продуктов
        const productIds = await recipeService.getProductIdsByNames(productNames);
        if (!productIds.length) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Используем исправленную логику для поиска рецептов
        const recipes = await recipeService.fetchRecipesByPartialProducts(productIds, limit, offset);
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getRecipeByName = async (req, res) => {
    const { name } = req.params;
    try {
        const recipe = await recipeService.fetchRecipeByName(name);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getRecipesByTags = async (req, res) => {
    const { tags } = req.body; // Ожидаем массив тегов в теле запроса
    const limit = req.body.limit;
    const offset = req.body.offset;
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({ message: 'Invalid input: tags must be a non-empty array' });
    }

    try {
        const recipes = await recipeService.fetchRecipesByTags(tags, limit, offset);

        if (!recipes.length) {
            return res.status(404).json({ message: 'No recipes found for these tags' });
        }

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getAllRecipes = async (req, res) => {
    const { target_calories, target_protein, target_fat } = req.query;
    const userId = req.user.user_id;

    if (!target_calories || !target_protein || !target_fat) {
        return res.status(400).json({ message: 'Missing required query parameters' });
    }

    try {
        const recipes = await recipeService.fetchAllRecipes(userId, target_calories, target_protein, target_fat);
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Экспорт функций
module.exports = {
    getRecipeById,
    getRecipesByExactProducts,
    getRecipesByPartialProducts,
    getRecipesByExactProductsFromString,
    getRecipesByPartialProductsFromString,
    getRecipeByName,  // Новый экспорт
    getRecipesByTags,
    getAllRecipes
};
