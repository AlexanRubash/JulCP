const productService = require('./product.service');

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

module.exports = {
    getAllProducts,
    searchProducts
};
