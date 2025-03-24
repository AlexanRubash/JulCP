const userUnwantedProductsService = require('./user_unwanted_products.service');

// Получение списка нежелательных продуктов пользователя
const getUserUnwantedProducts = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const products = await userUnwantedProductsService.getUserUnwantedProducts(userId);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get unwanted products' });
    }
};

// Добавление продукта в нежелательные
const addUserUnwantedProduct = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const productId  = req.params.id;
        await userUnwantedProductsService.addUserUnwantedProduct(userId, productId);
        res.status(201).json({ message: 'Product added to unwanted list' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add unwanted product' });
    }
};

// Удаление продукта из нежелательных
const removeUserUnwantedProduct = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const productId  = req.params.id;
        await userUnwantedProductsService.removeUserUnwantedProduct(userId, productId);
        res.json({ message: 'Product removed from unwanted list' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove unwanted product' });
    }
};

module.exports = {
    getUserUnwantedProducts,
    addUserUnwantedProduct,
    removeUserUnwantedProduct
};
