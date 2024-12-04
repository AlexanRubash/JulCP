const db = require('../../shared/database/db');

// Получение основной информации о рецепте
const getRecipeById = async (id) => {
    const query = 'SELECT * FROM recipes WHERE recipe_id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// Получение продуктов рецепта
const getRecipeProducts = async (recipeId) => {
    const query = `
        SELECT p.product_id, p.name, rp.quantity
        FROM recipe_products rp
        JOIN products p ON rp.product_id = p.product_id
        WHERE rp.recipe_id = $1;
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows;
};

// Получение тегов рецепта
const getRecipeTags = async (recipeId) => {
    const query = `
        SELECT t.name
        FROM recipe_tags rt
        JOIN tags t ON rt.tag_id = t.tag_id
        WHERE rt.recipe_id = $1;
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows.map(row => row.name);
};

// Получение изображения рецепта
const getRecipeImage = async (recipeId) => {
    const query = `
        SELECT image_url
        FROM recipe_images
        WHERE recipe_id = $1
        LIMIT 1;
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows[0] || null;
};

// Получение рецептов по точным продуктам
const getRecipesByExactProducts = async (productIds) => {
    const query = `
        SELECT r.recipe_id, r.name, r.cooking_time
        FROM recipes r
        JOIN recipe_products rp ON r.recipe_id = rp.recipe_id
        GROUP BY r.recipe_id
        HAVING NOT EXISTS (
            SELECT 1
            FROM recipe_products
            WHERE recipe_id = r.recipe_id
            AND product_id NOT IN (SELECT unnest($1::integer[]))
        );
    `;
    const result = await db.query(query, [productIds]);
    return result.rows;
};

// Получение рецептов по частичному совпадению продуктов с улучшенной фильтрацией
const getRecipesByPartialProducts = async (productIds) => {
    const query = `
        SELECT r.recipe_id, r.name, r.cooking_time
        FROM recipes r
        JOIN recipe_products rp ON r.recipe_id = rp.recipe_id
        WHERE rp.product_id = ANY($1::int[])
        GROUP BY r.recipe_id;
    `;
    const result = await db.query(query, [productIds]);
    return result.rows;
};

const findProductIdsByNames = async (productNames) => {
    const query = `
        SELECT product_id
        FROM products
        WHERE name = ANY($1::text[]);
    `;
    const result = await db.query(query, [productNames]);
    return result.rows.map(row => row.product_id);
};

module.exports = {
    getRecipeById,
    getRecipeProducts,
    getRecipeTags,
    getRecipeImage,
    getRecipesByExactProducts,
    getRecipesByPartialProducts,
    findProductIdsByNames
};
