const db = require('../../shared/database/db');

// Работа с базой данных для рецептов
const createRecipe = async (recipeData) => {
    const { name, description, cooking_time, products, tags, image_url, steps } = recipeData;


    // Вставляем рецепт в базу данных
    const recipeResult = await db.query(
        `INSERT INTO recipes (name, description, cooking_time, is_global) 
         VALUES ($1, $2, $3, TRUE) RETURNING recipe_id;`,
        [name, description, cooking_time]
    );

    const recipeId = recipeResult.rows[0].recipe_id;

    // Добавление продуктов в рецепт
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

        // Вставляем продукт в рецепт
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

const updateRecipe = async (id, recipeData) => {
    const { name, description, cooking_time, products, tags, steps, image_url, step_images } = recipeData;
    const result = await db.query(`SELECT is_global, created_by FROM recipes WHERE recipe_id = $1;`, [id]);

    const recipe = result.rows[0];

    await db.query(
        `UPDATE recipes SET name = $1, description = $2, cooking_time =$3 WHERE recipe_id = $4;`,
        [name, description, cooking_time, id]
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

const updateUser = async (id, username, hashedPassword, role) => {
    try {
        await db.query(
            'UPDATE users SET username = $1, password_hash = $2, role = $3 WHERE user_id = $4',
            [username, hashedPassword, role ,id]
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

const getProducts = async () => {
    const query = `
        SELECT product_id, name, description, category_id, image
        FROM products
    `;
    const result = await db.query(query);
    return result.rows;
};

const getProductById = async (productId) => {
    const query = `
        SELECT product_id, name, description, category_id, image
        FROM products
        WHERE product_id = $1;
    `;
    const result = await db.query(query, [productId]);
    return result.rows[0];
};

// Методы для работы с категориями

const getCategories = async () => {
    const query = `
        SELECT category_id, name
        FROM categories;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getCategoryById = async (categoryId) => {
    const query = `
        SELECT category_id, name
        FROM categories
        WHERE category_id = $1;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows[0];
};

const createCategory = async (name) => {
    const query = `
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING category_id, name;
    `;
    const result = await db.query(query, [name]);
    return result.rows[0];
};

const updateCategory = async (categoryId, name) => {
    const query = `
        UPDATE categories
        SET name = $1
        WHERE category_id = $2
        RETURNING category_id, name;
    `;
    const result = await db.query(query, [name, categoryId]);
    return result.rows[0];
};

const deleteCategory = async (categoryId) => {
    const query = `
        DELETE FROM categories
        WHERE category_id = $1
        RETURNING category_id, name;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows[0]; // Возвращаем удаленную категорию, если нужно
};

// Получение всех тегов
const getTags = async () => {
    const query = `
        SELECT tag_id, name
        FROM tags
    `;
    const result = await db.query(query);
    return result.rows;
};

// Получение тега по ID
const getTagById = async (tagId) => {
    const query = `
        SELECT tag_id, name
        FROM tags
        WHERE tag_id = $1
    `;
    const result = await db.query(query, [tagId]);
    return result.rows[0];
};

// Создание нового тега
const createTag = async (name) => {
    const query = `
        INSERT INTO tags (name)
        VALUES ($1)
        RETURNING tag_id, name
    `;
    const result = await db.query(query, [name]);
    return result.rows[0];
};

// Обновление тега по ID
const updateTag = async (tagId, name) => {
    const query = `
        UPDATE tags
        SET name = $1
        WHERE tag_id = $2
        RETURNING tag_id, name
    `;
    const result = await db.query(query, [name, tagId]);
    return result.rows[0];
};

// Удаление тега по ID
const deleteTag = async (tagId) => {
    const query = `
        DELETE FROM tags
        WHERE tag_id = $1
        RETURNING tag_id
    `;
    const result = await db.query(query, [tagId]);
    return result.rows[0];
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
    getProductById,
    getProducts,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
};

