const db = require('../../shared/database/db');

// Получение основной информации о рецепте
const getRecipeById = async (id) => {
    const query = 'SELECT * FROM recipes WHERE recipe_id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
};
// Получение рецепта по имени
const getRecipeByName = async (name) => {
    const query = `
    SELECT * FROM recipes
    WHERE name ILIKE $1
    `;
    const result = await db.query(query, [`%${name}%`]); // Используем % для частичного совпадения
    return result.rows; // Возвращаем все найденные рецепты
};

// Получение рецептов по тегу
const getRecipesByTag = async (tag) => {
    const query = `
        SELECT r.recipe_id, r.name, r.cooking_time, r.is_global, r.created_by
        FROM recipes r
        JOIN recipe_tags rt ON r.recipe_id = rt.recipe_id
        JOIN tags t ON rt.tag_id = t.tag_id
        WHERE t.name = $1;
    `;
    const result = await db.query(query, [tag]);
    return result.rows.map(row => ({
        ...row,
        is_global: row.is_global,  // Возвращаем флаг глобальности
        created_by: row.is_global ? null : row.created_by  // Если не глобальный, возвращаем created_by
    }));
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
// recipeRepository.js
const getRecipeStepImages = async (recipeId) => {
    const result = await db.query(
        'SELECT step_number, image_data FROM step_images WHERE recipe_id = $1',
        [recipeId]
    );
    return result.rows;
};
// Получение рецептов по нескольким тегам с пагинацией
const getRecipesByTags = async (tags, limit, offset) => {
    const query = `
        SELECT r.recipe_id, r.name, r.description, r.cooking_time, r.is_global, r.created_by
        FROM recipes r
        JOIN recipe_tags rt ON r.recipe_id = rt.recipe_id
        JOIN tags t ON rt.tag_id = t.tag_id
        WHERE t.name = ANY($1::text[])
        GROUP BY r.recipe_id
        HAVING COUNT(DISTINCT t.name) = $2
        LIMIT $3 OFFSET $4;
    `;
    const result = await db.query(query, [tags, tags.length, limit, offset]);
    return result.rows;
};



// Получение тегов рецепта
const getRecipeTags = async (recipeId) => {
    const query = `
        SELECT t.name, t.tag_id
        FROM recipe_tags rt
        JOIN tags t ON rt.tag_id = t.tag_id
        WHERE rt.recipe_id = $1;
    `;
    const result = await db.query(query, [recipeId]);
    return result.rows;
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
// Получение рецептов по точному совпадению продуктов с улучшенной фильтрацией
const getRecipesByExactProducts = async (productIds) => {
    const query = `
        SELECT r.recipe_id, r.name, r.cooking_time, r.is_global, r.created_by
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
    return result.rows.map(row => ({
        ...row,
        is_global: row.is_global, // Возвращаем флаг глобальности
        created_by: row.is_global ? null : row.created_by // Если не глобальный, возвращаем created_by
    }));
};

// Получение рецептов по частичному совпадению продуктов с улучшенной фильтрацией
const getRecipesByPartialProducts = async (productIds, limit, offset) => {

    const query = `
        SELECT r.recipe_id, r.name, r.cooking_time, r.is_global, r.created_by
        FROM recipes r
        JOIN recipe_products rp ON r.recipe_id = rp.recipe_id
        WHERE rp.product_id = ANY($1::int[])
        GROUP BY r.recipe_id
        LIMIT $2 OFFSET $3;  -- Ограничиваем выборку с помощью LIMIT и OFFSET
    `;
    const result = await db.query(query, [productIds, limit, offset]);
    return result.rows.map(row => ({
        ...row,
        is_global: row.is_global, // Возвращаем флаг глобальности
        created_by: row.is_global ? null : row.created_by // Если не глобальный, возвращаем created_by
    }));
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
const checkIfFavorite = async (recipeId, userId) => {
    const query = 'SELECT * FROM favorites WHERE recipe_id = $1 AND user_id = $2';
    const result = await db.query(query, [recipeId, userId]);
    return result.rows.length > 0; // Если строка найдена, значит рецепт в избранном
};
module.exports = {
    getRecipeById,
    getRecipeProducts,
    getRecipeTags,
    getRecipeImage,
    getRecipesByExactProducts,
    getRecipesByPartialProducts,
    findProductIdsByNames,
    getRecipeStepImages,
    getRecipesByTag,
    getRecipeByName,
    getRecipesByTags,
    checkIfFavorite
};
