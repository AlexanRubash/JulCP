const db = require('../../shared/database/db');

const createUser = async (username, hashedPassword, role) => {
    await db.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
        [username, hashedPassword, role]
    );
};

const findUserByUsername = async (username) => {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0];
};

const saveRefreshToken = async (token, userId) => {
    await db.query('INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)', [token, userId]);
};

const findRefreshToken = async (token) => {
    const result = await db.query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
    return result.rows[0];
};
const deleteRefreshToken = async (token) => {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

// Работа с базой данных для рецептов
const createUserRecipe = async (recipeData, userId) => {
    const { name, description, cooking_time, products, tags, steps } = recipeData;

    if (!userId) {
        throw new Error('User ID is required to create a recipe');
    }

    const recipeResult = await db.query(
        `INSERT INTO recipes (name, description, cooking_time, created_by, is_global) 
         VALUES ($1, $2, $3, $4, FALSE) RETURNING recipe_id;`,
        [name, description, cooking_time, userId]
    );

    const recipeId = recipeResult.rows[0].recipe_id;

    // Добавление продуктов в рецепт
    for (const { product_id, quantity } of products) {
        await db.query(
            `INSERT INTO recipe_products (recipe_id, product_id, quantity) 
                 VALUES ($1, $2, $3);`,
            [recipeId, product_id, quantity]
        );
    }

    // Добавление тегов в рецепт
    for (const tagId of tags) {
        await db.query(
            `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2);`,
            [recipeId, tagId]
        );
    }

    // Добавление шагов в рецепт
    for (let i = 0; i < steps.length; i++) {
        await db.query(
            `UPDATE recipes SET steps = array_append(steps, $1) WHERE recipe_id = $2;`,
            [steps[i].description, recipeId]
        );

        if (steps[i].image_data) {
            await db.query(
                `INSERT INTO step_images (recipe_id, step_number, image_data) VALUES ($1, $2, $3);`,
                [recipeId, i + 1, steps[i].image_data]
            );
        }
    }

    return recipeId;
};



const updateUserRecipe = async (id, recipeData, userId) => {
    const { name, description, cooking_time, products, tags, steps } = recipeData;
    const result = await db.query(`SELECT is_global, created_by FROM recipes WHERE recipe_id = $1;`, [id]);

    if (result.rows.length === 0) {
        throw new Error('Recipe not found');
    }

    const recipe = result.rows[0];

    // Если рецепт глобальный, выбрасываем ошибку
    if (recipe.is_global) {
        throw new Error('You cannot update global recipes');
    }

    // Если рецепт не глобальный, проверяем, является ли пользователь создателем рецепта
    if (recipe.created_by !== userId) {
        throw new Error('You can only update your own recipes');
    }
    await db.query(
        `UPDATE recipes SET name = $1, description = $2, cooking_time = $3 WHERE recipe_id = $4 AND created_by = $5;`,
        [name, description, cooking_time, id, userId]
    );

    await db.query(`DELETE FROM recipe_products WHERE recipe_id = $1;`, [id]);
    for (const product of products) {
        await db.query(
            `INSERT INTO recipe_products (recipe_id, product_id, quantity) VALUES ($1, $2, $3);`,
            [id, product.product_id, product.quantity]
        );
    }

    await db.query(`DELETE FROM recipe_tags WHERE recipe_id = $1;`, [id]);
    for (const tagId of tags) {
        await db.query(
            `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2);`,
            [id, tagId]
        );
    }

    await db.query(`DELETE FROM step_images WHERE recipe_id = $1;`, [id]);
    for (let i = 0; i < steps.length; i++) {
        await db.query(
            `UPDATE recipes SET steps = array_append(steps, $1) WHERE recipe_id = $2;`,
            [steps[i].description, id]
        );
        if (steps[i].image_data) {
            await db.query(
                `INSERT INTO step_images (recipe_id, step_number, image_data) VALUES ($1, $2, $3);`,
                [id, i + 1, steps[i].image_data]
            );
        }
    }
};

const deleteUserRecipe = async (id, userId) => {
    // Сначала проверяем, является ли рецепт глобальным
    const result = await db.query(`SELECT is_global, created_by FROM recipes WHERE recipe_id = $1;`, [id]);

    if (result.rows.length === 0) {
        throw new Error('Recipe not found');
    }

    const recipe = result.rows[0];

    // Если рецепт глобальный, выбрасываем ошибку
    if (recipe.is_global) {
        throw new Error('You cannot delete global recipes');
    }

    // Если рецепт не глобальный, проверяем, является ли пользователь создателем рецепта
    if (recipe.created_by !== userId) {
        throw new Error('You can only delete your own recipes');
    }

    // Удаляем рецепт
    await db.query('DELETE FROM recipe_products WHERE recipe_id = $1;', [id]);
    await db.query('DELETE FROM recipe_images WHERE recipe_id = $1;', [id]);
    await db.query('DELETE FROM step_images WHERE recipe_id = $1;', [id]);
    await db.query('DELETE FROM recipe_tags WHERE recipe_id = $1;', [id]);
    await db.query('DELETE FROM recipes WHERE recipe_id = $1;', [id]);
    await db.query(`DELETE FROM recipes WHERE recipe_id = $1`, [id]);
};

const addFavoriteRecipe = async (userId, recipeId) => {
    await db.query(`INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2);`, [userId, recipeId]);
};

const removeFavoriteRecipe = async (userId, recipeId) => {
    await db.query(`DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2;`, [userId, recipeId]);
};

// Работа с базой данных для продуктов
const createUserProduct = async (productData, userId) => {
    const { name, category_id, description, image } = productData;
    const result = await db.query(
        `INSERT INTO products (name, category_id, description, image, is_global, created_by) 
         VALUES ($1, $2, $3, $4, FALSE, $5) RETURNING product_id;`,
        [name, category_id, description, image, userId]
    );
    return result.rows[0].product_id;
};

const updateUserProduct = async (id, productData, userId) => {
    const { name, category_id, description, image } = productData;
    await db.query(
        `UPDATE products SET name = $1, category_id = $2, description = $3, image = $4 
         WHERE product_id = $5 AND created_by = $6 AND is_global = FALSE;`,
        [name, category_id, description, image, id, userId]
    );
};

const deleteUserProduct = async (id, userId) => {
    await db.query(`DELETE FROM products WHERE product_id = $1 AND created_by = $2 AND is_global = FALSE;`, [id, userId]);
};
module.exports = { createUser, findUserByUsername, saveRefreshToken, findRefreshToken, deleteRefreshToken,
    createUserRecipe,
    updateUserRecipe,
    deleteUserRecipe,
    addFavoriteRecipe,
    removeFavoriteRecipe,
    createUserProduct,
    updateUserProduct,
    deleteUserProduct,
};
