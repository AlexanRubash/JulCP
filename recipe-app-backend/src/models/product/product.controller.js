const productService = require('./product.service');
const repository = require("../admin/admin.repository");
const recipeRepository = require("../recipe/recipe.repository")

// Получение всех продуктов
const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// Поиск продуктов по названию
const searchProducts = async (req, res) => {
    const query  = req.query.q; // получаем запрос из строки запроса
    const userId = req.user.user_id;
    try {
        const products = await productService.searchProducts(query, userId); // выполняем поиск
        res.json(products); // отправляем результаты на клиент
    } catch (err) {
        res.status(500).json({ error: 'Failed to search products' });
    }
};
const getProducts = async (req, res) => {
    try {
        const products = await repository.getProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
};
const getCategories = async (req, res) => {
    try {
        const categories = await repository.getCategories(); // Получаем все категории
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving categories' });
    }
};
const getProductById = async (req, res) => {
    try {
        const product = await repository.getProductById(req.params.id); // Получаем ID продукта из параметров
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving product' });
    }
};
const getRecipesByProduct = async (req, res) => {
    try {
        const product = await recipeRepository.getRecipesByProduct(req.params.id); // Получаем ID продукта из параметров
        if (!product) {
            return res.status(404).json({ message: 'Recipes not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving product' });
    }
};
module.exports = {
    getAllProducts,
    searchProducts,
    getProducts,
    getCategories,
    getProductById,
    getRecipesByProduct
};
