const userUnwantedProductsRepository = require('./user_unwanted_products.repository');

const getUserUnwantedProducts = async (userId) => {
    return await userUnwantedProductsRepository.getUserUnwantedProducts(userId);
};

const addUserUnwantedProduct = async (userId, productId) => {
    return await userUnwantedProductsRepository.addUserUnwantedProduct(userId, productId);
};

const removeUserUnwantedProduct = async (userId, productId) => {
    return await userUnwantedProductsRepository.removeUserUnwantedProduct(userId, productId);
};

module.exports = {
    getUserUnwantedProducts,
    addUserUnwantedProduct,
    removeUserUnwantedProduct
};
