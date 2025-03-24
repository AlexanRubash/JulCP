const db = require('../../shared/database/db');

// Получение нежелательных продуктов пользователя
const getUserUnwantedProducts = async (userId) => {
    const query = `
        SELECT p.product_id, p.name
        FROM user_unwanted_products uup
        JOIN products p ON uup.product_id = p.product_id
        WHERE uup.user_id = $1
    `;    const result = await db.query(query, [userId]);
    return result.rows;
};

// Добавление нежелательного продукта пользователю
const addUserUnwantedProduct = async (userId, productId) => {
    const query = 'INSERT INTO user_unwanted_products (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await db.query(query, [userId, productId]);
};

// Удаление нежелательного продукта пользователя
const removeUserUnwantedProduct = async (userId, productId) => {
    const query = 'DELETE FROM user_unwanted_products WHERE user_id = $1 AND product_id = $2';
    await db.query(query, [userId, productId]);
};

module.exports = {
    getUserUnwantedProducts,
    addUserUnwantedProduct,
    removeUserUnwantedProduct
};
