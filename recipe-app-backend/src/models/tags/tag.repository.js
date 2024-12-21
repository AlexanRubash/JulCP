const db = require('../../shared/database/db');

// Создать тег
const createTag = async (name) => {
    const result = await db.query(
        `INSERT INTO tags (name) VALUES ($1) RETURNING tag_id;`,
        [name]
    );
    return result.rows[0].tag_id;
};

// Обновить тег
const updateTag = async (id, name) => {
    await db.query(
        `UPDATE tags SET name = $1 WHERE tag_id = $2;`,
        [name, id]
    );
};

// Удалить тег
const deleteTag = async (id) => {
    await db.query(`DELETE FROM tags WHERE tag_id = $1;`, [id]);
};

// Получить все теги
const getAllTags = async () => {
    const result = await db.query(`SELECT * FROM tags;`);
    return result.rows;
};
// Поиск продуктов по названию
const searchTagsByName = async (searchTerm) => {
    const query = `
        SELECT * FROM tags
        WHERE name ILIKE $1
        LIMIT 10;
    `;
    const result = await db.query(query, [`%${searchTerm}%`]);
    console.log(result.rows);
    return result.rows;
};
module.exports = {
    createTag,
    updateTag,
    deleteTag,
    getAllTags,
    searchTagsByName
};
