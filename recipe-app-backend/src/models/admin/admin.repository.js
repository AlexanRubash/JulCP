const db = require('../../shared/database/db');

// Работа с базой данных для рецептов
const createRecipe = async (recipeData) => {
    const { name, description, cooking_time, products, tags, image_url, steps } = recipeData;

    try {
        const recipeResult = await db.query(
            `INSERT INTO recipes (name, description, cooking_time) 
             VALUES ($1, $2, $3) RETURNING recipe_id;`,
            [name, description, cooking_time]
        );
        const recipeId = recipeResult.rows[0].recipe_id;

        for (const { product_id, quantity } of products) {
            await db.query(
                `INSERT INTO recipe_products (recipe_id, product_id, quantity) 
                 VALUES ($1, $2, $3);`,
                [recipeId, product_id, quantity]
            );
        }

        for (const tagId of tags) {
            await db.query(
                `INSERT INTO recipe_tags (recipe_id, tag_id) 
                 VALUES ($1, $2);`,
                [recipeId, tagId]
            );
        }

        if (image_url) {
            await db.query(
                `INSERT INTO recipe_images (recipe_id, image_url) 
                 VALUES ($1, $2);`,
                [recipeId, image_url]
            );
        }

        for (let i = 0; i < steps.length; i++) {
            const { description, image_data } = steps[i];
            const stepNumber = i + 1;

            await db.query(
                `UPDATE recipes 
                 SET steps = array_append(steps, $1)
                 WHERE recipe_id = $2;`,
                [description, recipeId]
            );

            if (image_data) {
                await db.query(
                    `INSERT INTO step_images (recipe_id, step_number, image_data) 
                     VALUES ($1, $2, $3);`,
                    [recipeId, stepNumber, image_data]
                );
            }
        }

        return recipeId;
    } catch (error) {
        throw new Error(`Failed to create recipe: ${error.message}`);
    }
};

const updateRecipe = async (id, recipeData) => {
    const { name, description, cooking_time, products, tags, image_url } = recipeData;

    try {
        await db.query(
            `UPDATE recipes 
             SET name = $1, description = $2, cooking_time = $3 
             WHERE recipe_id = $4;`,
            [name, description, cooking_time, id]
        );

        await db.query('DELETE FROM recipe_products WHERE recipe_id = $1;', [id]);
        for (const { product_id, quantity } of products) {
            await db.query(
                `INSERT INTO recipe_products (recipe_id, product_id, quantity) 
                 VALUES ($1, $2, $3);`,
                [id, product_id, quantity]
            );
        }

        await db.query('DELETE FROM recipe_tags WHERE recipe_id = $1;', [id]);
        for (const tagId of tags) {
            await db.query(
                `INSERT INTO recipe_tags (recipe_id, tag_id) 
                 VALUES ($1, $2);`,
                [id, tagId]
            );
        }

        if (image_url) {
            await db.query('DELETE FROM recipe_images WHERE recipe_id = $1;', [id]);
            await db.query(
                `INSERT INTO recipe_images (recipe_id, image_url) 
                 VALUES ($1, $2);`,
                [id, image_url]
            );
        }
    } catch (error) {
        throw new Error(`Failed to update recipe: ${error.message}`);
    }
};

const deleteRecipe = async (id) => {
    try {
        await db.query('DELETE FROM recipe_products WHERE recipe_id = $1;', [id]);
        await db.query('DELETE FROM recipe_images WHERE recipe_id = $1;', [id]);
        await db.query('DELETE FROM step_images WHERE recipe_id = $1;', [id]);
        await db.query('DELETE FROM recipe_tags WHERE recipe_id = $1;', [id]);
        await db.query('DELETE FROM recipes WHERE recipe_id = $1;', [id]);
    } catch (error) {
        throw new Error(`Failed to delete recipe: ${error.message}`);
    }
};

// Работа с базой данных для пользователей
const createUser = async (username, hashedPassword, role) => {
    try {
        await db.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
            [username, hashedPassword, role]
        );
    } catch (error) {
        throw new Error(`Failed to create user: ${error.message}`);
    }
};

const updateUser = async (id, username, hashedPassword) => {
    try {
        await db.query(
            'UPDATE users SET username = $1, password_hash = $2 WHERE user_id = $3',
            [username, hashedPassword, id]
        );
    } catch (error) {
        throw new Error(`Failed to update user: ${error.message}`);
    }
};

const deleteUser = async (id) => {
    try {
        await db.query('DELETE FROM favorites WHERE user_id = $1;', [id]);
        await db.query('DELETE FROM recipes WHERE created_by = $1;', [id]);
        await db.query('DELETE FROM users WHERE user_id = $1;', [id]);
    } catch (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
    }
};

// Работа с базой данных для продуктов
const createProduct = async (productData) => {
    const { name, category_id, description, image } = productData;
    try {
        const result = await db.query(
            'INSERT INTO products (name, category_id, description, image) VALUES ($1, $2, $3, $4) RETURNING product_id;',
            [name, category_id, description, image]
        );
        return result.rows[0].product_id;
    } catch (error) {
        throw new Error(`Failed to create product: ${error.message}`);
    }
};

const updateProduct = async (id, productData) => {
    const { name, category_id, description, image } = productData;
    try {
        await db.query(
            'UPDATE products SET name = $1, category_id = $2, description = $3, image = $4 WHERE product_id = $5;',
            [name, category_id, description, image, id]
        );
    } catch (error) {
        throw new Error(`Failed to update product: ${error.message}`);
    }
};

const deleteProduct = async (id) => {
    try {
        await db.query('DELETE FROM recipe_products WHERE product_id = $1;', [id]);
        await db.query('DELETE FROM products WHERE product_id = $1;', [id]);
    } catch (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }
};

module.exports = {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    createUser,
    updateUser,
    deleteUser,
    createProduct,
    updateProduct,
    deleteProduct,
};
