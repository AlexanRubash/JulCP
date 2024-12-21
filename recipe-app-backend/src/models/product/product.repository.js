const db = require('../../shared/database/db');

// Получение продукта по ID
const getProductById = async (productId) => {
    const query = 'SELECT * FROM products WHERE product_id = $1';
    const result = await db.query(query, [productId]);
    return result.rows[0];
};

// Поиск продуктов по названию
const searchProductsByName = async (searchTerm, userID) => {
    const query = `
        SELECT * FROM products
        WHERE name ILIKE $1
        AND (is_global = TRUE OR created_by = $2)
        ORDER BY LENGTH(name) ASC
        LIMIT 50;
    `;
    const result = await db.query(query, [`%${searchTerm}%`, userID]);
    return result.rows;
};



// Получение всех продуктов
const getAllProducts = async () => {
    const query = 'SELECT * FROM products';
    const result = await db.query(query);
    return result.rows;
};

module.exports = {
    getProductById,
    searchProductsByName,
    getAllProducts
};
