const tagService = require('./tag.service');
const productService = require("../product/product.service");

// Получить все теги
const getAllTags = async (req, res) => {
    try {
        const tags = await tagService.getAllTags();
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Создать тег (только для администратора)
const createTag = async (req, res) => {
    try {
        const { name } = req.body;
        const tagId = await tagService.createTag(name);
        res.status(201).json({ tag_id: tagId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Обновить тег (только для администратора)
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await tagService.updateTag(id, name);
        res.status(200).json({ message: 'Tag updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Удалить тег (только для администратора)
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        await tagService.deleteTag(id);
        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const searchTagByName = async (req, res) =>
{
    const query  = req.query.q; // получаем запрос из строки запроса
    try {
        const tags = await tagService.searchTags(query); // выполняем поиск
        console.log(tags);
        res.json(tags); // отправляем результаты на клиент
    } catch (err) {
        res.status(500).json({ error: 'Failed to search products' });
    }
}
module.exports = {
    getAllTags,
    createTag,
    updateTag,
    deleteTag,
    searchTagByName
};
