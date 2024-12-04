const recipeService = require('./recipe.service');

// 1. Получение всех данных о рецепте по его id
const getRecipeById = async (req, res) => {
    const { id } = req.params;
    try {
        const recipe = await recipeService.fetchRecipeById(id);
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
        const recipes = await recipeService.fetchRecipesByPartialProducts(productIds);
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
    getRecipesByPartialProductsFromString
};
