const pool = require('../config/db');
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const registerUser = require('./userController').registerUser;

// Добавление нового рецепта
const createRecipe = async (req, res) => {
    const { name, description, cooking_time, products, tags, image_url, steps } = req.body;

    try {
        const recipeQuery = `
            INSERT INTO recipes (name, description, cooking_time) 
            VALUES ($1, $2, $3) RETURNING recipe_id;
        `;
        const recipeResult = await pool.query(recipeQuery, [name, description, cooking_time]);
        const recipeId = recipeResult.rows[0].recipe_id;

        for (const product of products) {
            const { product_id, quantity } = product;
            const productQuery = `
                INSERT INTO recipe_products (recipe_id, product_id, quantity) 
                VALUES ($1, $2, $3);
            `;
            await pool.query(productQuery, [recipeId, product_id, quantity]);
        }

        for (const tagId of tags) {
            const tagQuery = `
                INSERT INTO recipe_tags (recipe_id, tag_id) 
                VALUES ($1, $2);
            `;
            await pool.query(tagQuery, [recipeId, tagId]);
        }

        if (image_url) {
            const imageQuery = `
                INSERT INTO recipe_images (recipe_id, image_url) 
                VALUES ($1, $2);
            `;
            await pool.query(imageQuery, [recipeId, image_url]);
        }

        for (let i = 0; i < steps.length; i++) {
            const { description, image_data } = steps[i];

            // Insert step
            const stepNumber = i + 1;
            const stepQuery = `
                UPDATE recipes 
                SET steps = array_append(steps, $1)
                WHERE recipe_id = $2;
            `;
            await pool.query(stepQuery, [description, recipeId]);

            // Insert step image if it exists
            if (image_data) {
                const stepImageQuery = `
                    INSERT INTO step_images (recipe_id, step_number, image_data) 
                    VALUES ($1, $2, $3);
                `;
                await pool.query(stepImageQuery, [recipeId, stepNumber, image_data]);
            }
        }

        res.status(201).json({ message: 'Recipe created successfully', recipeId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Редактирование рецепта
const updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { name, description, cooking_time, products, tags, image_url } = req.body;

    try {
        const updateRecipeQuery = `
            UPDATE recipes 
            SET name = $1, description = $2, cooking_time = $3 
            WHERE recipe_id = $4;
        `;
        await pool.query(updateRecipeQuery, [name, description, cooking_time, id]);

        await pool.query('DELETE FROM recipe_products WHERE recipe_id = $1;', [id]);
        for (const product of products) {
            const { product_id, quantity } = product;
            const productQuery = `
                INSERT INTO recipe_products (recipe_id, product_id, quantity) 
                VALUES ($1, $2, $3);
            `;
            await pool.query(productQuery, [id, product_id, quantity]);
        }

        await pool.query('DELETE FROM recipe_tags WHERE recipe_id = $1;', [id]);
        for (const tagId of tags) {
            const tagQuery = `
                INSERT INTO recipe_tags (recipe_id, tag_id) 
                VALUES ($1, $2);
            `;
            await pool.query(tagQuery, [id, tagId]);
        }

        if (image_url) {
            await pool.query('DELETE FROM recipe_images WHERE recipe_id = $1;', [id]);
            const imageQuery = `
                INSERT INTO recipe_images (recipe_id, image_url) 
                VALUES ($1, $2);
            `;
            await pool.query(imageQuery, [id, image_url]);
        }

        res.status(200).json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Удаление рецепта
const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM recipe_products WHERE recipe_id = $1;', [id]);
        await pool.query('DELETE FROM recipe_images WHERE recipe_id = $1;', [id]);
        await pool.query('DELETE FROM step_images WHERE recipe_id = $1;', [id]);
        await pool.query('DELETE FROM recipe_tags WHERE recipe_id = $1;', [id]);
        await pool.query('DELETE FROM recipes WHERE recipe_id = $1;', [id]);
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const createUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
            [username, hashedPassword, 'user']
        );
        res.status(201).send('User registered');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
};
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'UPDATE users SET username = $1, password_hash = $2 WHERE user_id = $3',
            [username, hashedPassword, id]
        );
        res.status(200).send('User updated');
    } catch (err) {
        res.status(500).send('Error updating user');
    }
}
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM favorites WHERE user_id = $1', [id]);
        await db.query('DELETE FROM step_images WHERE recipe_id IN (SELECT recipe_id FROM recipes WHERE created_by = $1)', [id]);
        await db.query('DELETE FROM recipe_products WHERE recipe_id IN (SELECT recipe_id FROM recipes WHERE created_by = $1)', [id]);
        await db.query('DELETE FROM recipe_tags WHERE recipe_id IN (SELECT recipe_id FROM recipes WHERE created_by = $1)', [id]);
        await db.query('DELETE FROM recipe_images WHERE recipe_id IN (SELECT recipe_id FROM recipes WHERE created_by = $1)', [id]);
        await db.query('DELETE FROM recipes WHERE created_by = $1', [id]);
        await db.query('DELETE FROM users WHERE user_id = $1', [id]);
        res.status(200).send('User deleted');
    } catch (err) {
        res.status(500).send('Error deleting user');
    }
}
// Добавление нового продукта
const createProduct = async (req, res) => {
    const { name, category_id, description, is_global, created_by, image } = req.body;

    try {
        const productQuery = `
            INSERT INTO products (name, category_id, description, image) 
            VALUES ($1, $2, $3, $4) RETURNING product_id;
        `;
        const productResult = await pool.query(productQuery, [name, category_id, description, image]);
        const productId = productResult.rows[0].product_id;

        res.status(201).json({ message: 'Product created successfully', productId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Обновление продукта
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category_id, description, is_global, created_by, image } = req.body;

    try {
        const updateProductQuery = `
            UPDATE products 
            SET name = $1, category_id = $2, description = $3, is_global = $4, created_by = $5, image = $6
            WHERE product_id = $7;
        `;
        await pool.query(updateProductQuery, [name, category_id, description, is_global, created_by, image, id]);

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Удаление продукта
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM recipe_products WHERE product_id = $1;', [id]);  // Удаляем все связи с рецептами
        await pool.query('DELETE FROM products WHERE product_id = $1;', [id]);  // Удаляем сам продукт

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
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
    deleteProduct
};
