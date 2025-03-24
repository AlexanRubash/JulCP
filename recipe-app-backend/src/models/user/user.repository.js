const db = require('../../shared/database/db');

const createUser = async (username, hashedPassword, role) => {
    const result = await db.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, username, role',
        [username, hashedPassword, role]
    );

    // Возвращаем параметры созданного пользователя
    return result.rows[0]; // Здесь возвращаются user_id, username и role
};

const findUserById = async (userId) => {
    const result = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
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
    const { name, description, cooking_time, products, tags, image_url, steps } = recipeData;

    if (!userId) {
        throw new Error('User ID is required to create a recipe');
    }

    // Вставляем рецепт в базу данных
    const recipeResult = await db.query(
        `INSERT INTO recipes (name, description, cooking_time, created_by, is_global) 
         VALUES ($1, $2, $3, $4, FALSE) RETURNING recipe_id;`,
        [name, description, cooking_time, userId]
    );

    const recipeId = recipeResult.rows[0].recipe_id;

    // Добавление продуктов в рецепт
    for (let { product_id, quantity, product_name, unit_id } of products) {
        if (product_id === null) {
            // Ищем продукт по имени в базе данных
            const productResult = await db.query(
                `SELECT product_id FROM products WHERE name = $1 LIMIT 1;`,
                [product_name]
            );

            if (productResult.rows.length === 0) {
                throw new Error(`Product with name "${product_name}" not found`);
            }

            product_id = productResult.rows[0].product_id; // Обновляем product_id с найденного продукта
        }

        // Если unit_id не указан, ставим 145 (граммы)
        unit_id = unit_id ?? 145;

        // Вставляем продукт в рецепт
        await db.query(
            `INSERT INTO recipe_products (recipe_id, product_id, quantity_value, unit_id) 
             VALUES ($1, $2, $3, $4);`,
            [recipeId, product_id, quantity, unit_id]
        );
    }

    // Добавление тегов в рецепт
    for (const tagId of tags) {
        await db.query(
            `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2);`,
            [recipeId, tagId]
        );
    }

    // Добавление изображения в рецепт
    if (image_url) {
        await db.query(
            `INSERT INTO recipe_images (recipe_id, image_url) 
             VALUES ($1, $2);`,
            [recipeId, image_url]
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
                `INSERT INTO step_images (recipe_id, step_number, image_data) 
                 VALUES ($1, $2, $3);`,
                [recipeId, i + 1, steps[i].image_data]
            );
        }
    }

    return recipeId;
};


const updateUserRecipe = async (id, recipeData, userId) => {
    const { name, description, cooking_time, products, tags, steps, image_url, step_images } = recipeData;
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
        `UPDATE recipes SET name = $1, description = $2, cooking_time =$3 WHERE recipe_id = $4 AND created_by = $5;`,
        [name, description, cooking_time, id, userId]
    );

    await db.query(`DELETE FROM recipe_images WHERE recipe_id=$1`, [id]);
    await db.query(
        `INSERT INTO recipe_images (recipe_id, image_url) VALUES ($1, $2);`,
        [id, image_url]
    );

    await db.query(`DELETE FROM recipe_products WHERE recipe_id = $1`, [id]);
    for (let { product_id, quantity, product_name } of products) {
        if (product_id === null) {
            // Ищем продукт по имени в базе данных
            const productResult = await db.query(
                `SELECT product_id FROM products WHERE name = $1 LIMIT 1;`,
                [product_name]
            );

            if (productResult.rows.length === 0) {
                throw new Error(`Product with name "${product_name}" not found`);
            }

            product_id = productResult.rows[0].product_id; // Обновляем product_id с найденного продукта
        }
        await db.query(
            `INSERT INTO recipe_products (recipe_id, product_id, quantity) VALUES ($1, $2, $3);`,
            [id, product_id, quantity]
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
    await db.query(
        `UPDATE recipes SET steps = $1 WHERE recipe_id = $2;`,
        [steps, id]
    );
    if(step_images){
        for (let i = 0; i < step_images.length; i++) {
            await db.query(
                `INSERT INTO step_images (recipe_id, step_number, image_data) VALUES ($1, $2, $3);`,
                [id, step_images[i].step_number, step_images[i].image_url]
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
const getFavoriteRecipes = async (userId) => {
    const query = `
        SELECT r.recipe_id, r.name, r.description, r.cooking_time, ri.image_url
        FROM favorites f
        JOIN recipes r ON f.recipe_id = r.recipe_id
        LEFT JOIN recipe_images ri ON r.recipe_id = ri.recipe_id
        WHERE f.user_id = $1;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};
const getUserRecipes = async (userId) => {
    const query = `
        SELECT r.recipe_id, r.name, r.description, r.cooking_time, r.steps, ri.image_url
        FROM recipes r
        LEFT JOIN recipe_images ri ON r.recipe_id = ri.recipe_id
        WHERE r.created_by = $1 AND r.is_global = FALSE;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};


const addFavoriteRecipe = async (userId, recipeId) => {
    await db.query(`INSERT INTO favorites (user_id, recipe_id) VALUES ($1, $2);`, [userId, recipeId]);
};

const removeFavoriteRecipe = async (userId, recipeId) => {
    try {
        // Проверяем, существует ли запись
        const result = await db.query(
            `SELECT 1 FROM favorites WHERE user_id = $1 AND recipe_id = $2;`,
            [userId, recipeId]
        );

        if (result.rowCount === 0) {
            throw new Error("Recipe is not in favorites.");
        }

        // Удаляем запись, если она существует
        await db.query(
            `DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2;`,
            [userId, recipeId]
        );
    } catch (error) {
        throw new Error(`Failed to remove favorite recipe: ${error.message}`);
    }
};


// Работа с базой данных для продуктов
const createUserProduct = async (productData, userId) => {
    const { name, category_id, description } = productData;
    const result = await db.query(
        `INSERT INTO products (name, category_id, description, is_global, created_by) 
         VALUES ($1, $2, $3, FALSE, $4) RETURNING product_id;`,
        [name, category_id, description, userId]
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
    try {
        // Проверяем, существует ли продукт
        const result = await db.query(
            `SELECT 1 FROM products WHERE product_id = $1 AND created_by = $2 AND is_global = FALSE;`,
            [id, userId]
        );

        if (result.rowCount === 0) {
            throw new Error("Product not found or cannot be deleted.");
        }

        // Удаляем продукт, если он существует
        await db.query(
            `DELETE FROM products WHERE product_id = $1 AND created_by = $2 AND is_global = FALSE;`,
            [id, userId]
        );
    } catch (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }
};
const getUserProducts = async (userId) => {
    const query = `
        SELECT product_id, name, description, category_id, image
        FROM products
        WHERE created_by = $1 AND is_global = FALSE;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

const getUserProductById = async (productId, userId) => {
    const query = `
        SELECT product_id, name, description, category_id, image
        FROM products
        WHERE product_id = $1 AND created_by = $2 AND is_global = FALSE;
    `;
    const result = await db.query(query, [productId, userId]);
    return result.rows[0];
};
module.exports = { createUser, findUserByUsername, saveRefreshToken, findRefreshToken, deleteRefreshToken,
    createUserRecipe,
    updateUserRecipe,
    deleteUserRecipe,
    addFavoriteRecipe,
    removeFavoriteRecipe,
    createUserProduct,
    updateUserProduct,
    getUserProducts,
    getUserProductById,
    deleteUserProduct,
    getFavoriteRecipes,
    getUserRecipes,
    findUserById
};
