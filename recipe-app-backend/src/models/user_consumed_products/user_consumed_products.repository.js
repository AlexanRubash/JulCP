const db = require('../../shared/database/db');

const addConsumedItem = async (userId, { product_id, recipe_id, quantity, unit_id, calories, proteins, fats, carbohydrates, meal }) => {
    const query = `
        INSERT INTO user_consumed_items (user_id, product_id, recipe_id, quantity, unit_id, calories, proteins, fats, carbohydrates)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *, 
        (SELECT name FROM products WHERE product_id = $2) AS product_name,
        (SELECT name FROM recipes WHERE recipe_id = $3) AS recipe_name;
    `;
    const values = [userId, product_id, recipe_id, quantity, unit_id, calories, proteins, fats, carbohydrates];
    const result = await db.query(query, values);
    return result.rows[0];
};

const getConsumedItemsByDate = async (userId, date) => {
    const query = `
        SELECT uci.consumption_id, uci.date, uci.quantity, uci.unit_id, 
               uci.calories, uci.proteins, uci.fats, uci.carbohydrates, 
               p.product_id, p.name AS product_name,
               r.recipe_id, r.name AS recipe_name
        FROM user_consumed_items uci
        LEFT JOIN products p ON uci.product_id = p.product_id
        LEFT JOIN recipes r ON uci.recipe_id = r.recipe_id
        WHERE uci.user_id = $1 AND DATE(uci.date) = $2;
    `;
    const result = await db.query(query, [userId, date]);
    return result.rows;
};

const deleteConsumedItem = async (userId, consumptionId) => {
    const query = 'DELETE FROM user_consumed_items WHERE consumption_id = $1 RETURNING *';
    const result = await db.query(query, [consumptionId]);
    return result.rowCount > 0;
};

const getUnitConversionToGrams = async (unitId) => {
    const query = `SELECT conversion_to_grams FROM units WHERE unit_id = $1;`;
    const result = await db.query(query, [unitId]);
    return result.rows[0]?.conversion_to_grams || null;
};

module.exports = {
    addConsumedItem,
    getConsumedItemsByDate,
    deleteConsumedItem,
    getUnitConversionToGrams
};
