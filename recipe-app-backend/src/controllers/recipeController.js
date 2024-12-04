const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware.js');

// 1. Получение всех данных о рецепте по его id
const getRecipeById = async (req, res) => {
    const { id } = req.params;
    try {
        // Получение информации о рецепте
        const recipeQuery = 'SELECT * FROM recipes WHERE recipe_id = $1';
        const recipeResult = await pool.query(recipeQuery, [id]);

        if (recipeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Получение продуктов для рецепта
        const productsQuery = `
            SELECT p.product_id, p.name, rp.quantity
            FROM recipe_products rp
            JOIN products p ON rp.product_id = p.product_id
            WHERE rp.recipe_id = $1;
        `;
        const productsResult = await pool.query(productsQuery, [id]);

        // Получение URL изображения рецепта
        const imageQuery = `
            SELECT image_url
            FROM recipe_images
            WHERE recipe_id = $1
            LIMIT 1;
        `;
        const imageResult = await pool.query(imageQuery, [id]);

        // Получение тегов для рецепта
        const tagsQuery = `
            SELECT t.name
            FROM recipe_tags rt
            JOIN tags t ON rt.tag_id = t.tag_id
            WHERE rt.recipe_id = $1;
        `;
        const tagsResult = await pool.query(tagsQuery, [id]);

        const recipe = recipeResult.rows[0];
        recipe.products = productsResult.rows;

        // Если изображение найдено, добавляем URL и описание в ответ
        if (imageResult.rows.length > 0) {
            recipe.image = {
                url: imageResult.rows[0].image_url,
                description: imageResult.rows[0].description, // добавляем описание изображения
            };
        } else {
            recipe.image = null; // Или можно пропустить это поле
        }

        // Добавляем теги в ответ
        recipe.tags = tagsResult.rows.map(row => row.name);

        res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Получение рецептов, которые содержат хотя бы указанные продукты
const getRecipesByExactProducts = async (req, res) => {
    const { product_ids: productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ message: 'Invalid input: productIds must be an array' });
    }

    try {
        // Сортируем productIds для точного совпадения
        const sortedProductIds = productIds.sort((a, b) => a - b);

        // Запрос для получения рецептов, которые не содержат лишних продуктов
        const query = `
            SELECT r.recipe_id, r.name, r.description, r.cooking_time
            FROM recipes r
            JOIN recipe_products rp ON r.recipe_id = rp.recipe_id
            GROUP BY r.recipe_id
            HAVING NOT EXISTS (
                -- Проверяем, что в рецепте нет продуктов, которых нет в запросе
                SELECT 1
                FROM recipe_products rp
                WHERE rp.recipe_id = r.recipe_id
                AND rp.product_id NOT IN (SELECT unnest($1::integer[]))  -- исключаем лишние продукты
            )
        `;

        // Запрос на поиск рецептов
        const result = await pool.query(query, [sortedProductIds]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ничего не найдено" });
        }

        // Для каждого рецепта получаем подробную информацию (продукты, теги и изображение)
        const recipes = await Promise.all(result.rows.map(async (recipe) => {
            // Получение продуктов для рецепта
            const productsQuery = `
                SELECT p.product_id, p.name, rp.quantity
                FROM recipe_products rp
                JOIN products p ON rp.product_id = p.product_id
                WHERE rp.recipe_id = $1;
            `;
            const productsResult = await pool.query(productsQuery, [recipe.recipe_id]);

            // Получение тегов для рецепта
            const tagsQuery = `
                SELECT t.name
                FROM recipe_tags rt
                JOIN tags t ON rt.tag_id = t.tag_id
                WHERE rt.recipe_id = $1;
            `;
            const tagsResult = await pool.query(tagsQuery, [recipe.recipe_id]);

            // Получение изображения рецепта
            const imageQuery = `
                SELECT image_url
                FROM recipe_images
                WHERE recipe_id = $1
                LIMIT 1;
            `;
            const imageResult = await pool.query(imageQuery, [recipe.recipe_id]);

            // Формируем объект рецепта с продуктами, тегами и изображением
            recipe.products = productsResult.rows;
            recipe.tags = tagsResult.rows.map(row => row.name);
            if (imageResult.rows.length > 0) {
                recipe.image = {
                    url: imageResult.rows[0].image_url,
                    description: imageResult.rows[0].description,
                };
            } else {
                recipe.image = null;
            }

            return recipe;
        }));

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// 3. Получение списка рецептов по частичному совпадению продуктов с ограничением на количество дополнительных ингредиентов
const getRecipesByPartialProducts = async (req, res) => {
    const { product_ids: productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ message: 'Invalid input: productIds must be an array' });
    }

    const numericProductIds = productIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    if (numericProductIds.length === 0) {
        return res.status(400).json({ message: 'Invalid input: productIds array must contain valid numbers' });
    }

    try {
        // 1. Получаем рецепты, которые содержат хотя бы один из указанных продуктов
        const query = `
            SELECT r.recipe_id, r.name, r.description, r.cooking_time
            FROM recipes r
            JOIN recipe_products rp ON r.recipe_id = rp.recipe_id
            WHERE rp.product_id = ANY($1::int[])
            GROUP BY r.recipe_id, r.name, r.description, r.cooking_time;
        `;
        const result = await pool.query(query, [numericProductIds]);

        // Для каждого рецепта получаем подробную информацию (продукты, теги и изображение)
        const recipes = await Promise.all(result.rows.map(async (recipe) => {
            // 2. Получаем все продукты для рецепта
            const productsQuery = `
                SELECT p.product_id, p.name, rp.quantity
                FROM recipe_products rp
                JOIN products p ON rp.product_id = p.product_id
                WHERE rp.recipe_id = $1;
            `;
            const productsResult = await pool.query(productsQuery, [recipe.recipe_id]);

            // 3. Получаем теги для рецепта
            const tagsQuery = `
                SELECT t.name
                FROM recipe_tags rt
                JOIN tags t ON rt.tag_id = t.tag_id
                WHERE rt.recipe_id = $1;
            `;
            const tagsResult = await pool.query(tagsQuery, [recipe.recipe_id]);

            // 4. Получаем изображение рецепта
            const imageQuery = `
                SELECT image_url
                FROM recipe_images
                WHERE recipe_id = $1
                LIMIT 1;
            `;
            const imageResult = await pool.query(imageQuery, [recipe.recipe_id]);

            // 5. Подсчитываем, сколько дополнительных ингредиентов в рецепте
            const recipeProductIds = productsResult.rows.map(product => product.product_id);
            const commonProductCount = numericProductIds.filter(id => recipeProductIds.includes(id)).length;
            const additionalProductCount = recipeProductIds.length - commonProductCount;

            // 6. Проверяем, что дополнительных продуктов не больше 3
            if (additionalProductCount <= 3) {
                // Формируем объект рецепта с продуктами, тегами и изображением
                recipe.products = productsResult.rows;
                recipe.tags = tagsResult.rows.map(row => row.name);
                if (imageResult.rows.length > 0) {
                    recipe.image = {
                        url: imageResult.rows[0].image_url,
                        description: imageResult.rows[0].description,
                    };
                } else {
                    recipe.image = null;
                }

                return recipe;
            }

            return null; // Если слишком много дополнительных продуктов, исключаем этот рецепт
        }));

        // Фильтруем null (рецепты, которые не прошли проверку по количеству дополнительных продуктов)
        const filteredRecipes = recipes.filter(recipe => recipe !== null);

        res.status(200).json(filteredRecipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Экспорт функций
module.exports = {
    getRecipeById,
    getRecipesByExactProducts,
    getRecipesByPartialProducts
};
