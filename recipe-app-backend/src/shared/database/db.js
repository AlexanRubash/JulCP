require('dotenv').config({ path: 'D:/Univer/jul_cp/recipe-app-backend/.env' }); // Подстройте путь, если запуск происходит из другой папки
const { Pool } = require('pg');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD); // Убедитесь, что это не undefined или пустая строка

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
