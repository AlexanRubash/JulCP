const productRepository = require('./product.repository');

// Поиск продуктов по названию
const searchProducts = async (searchTerm, userID) => {
    const products = await productRepository.searchProductsByName(searchTerm, userID);
    return products;
};

// Получение всех продуктов
const getAllProducts = async () => {
    const products = await productRepository.getAllProducts();
    return products;
};

module.exports = {
    searchProducts,
    getAllProducts
};
