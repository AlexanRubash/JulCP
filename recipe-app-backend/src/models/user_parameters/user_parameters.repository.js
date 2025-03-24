const db = require('../../shared/database/db');

const getUserParameters = async (userId) => {
    const query = 'SELECT * FROM user_parameters WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

const updateUserParameters = async (userId, params) => {
    const query = `
        INSERT INTO user_parameters (user_id, age, weight, height, goal, activity_level)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO UPDATE
        SET age = $2, weight = $3, height = $4, goal = $5, activity_level = $6;
    `;
    const values = [userId, params.age, params.weight, params.height, params.goal, params.activity_level];
    await db.query(query, values);
};

// Создание параметров пользователя (если их нет)
const createUserParameters = async (userId, params) => {
    const query = `
        INSERT INTO user_parameters (user_id, age, weight, height, goal, activity_level)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const values = [userId, params.age, params.weight, params.height, params.goal, params.activity_level];
    const result = await db.query(query, values);
    return result.rows[0];
};

module.exports = {
    getUserParameters,
    updateUserParameters,
    createUserParameters
};