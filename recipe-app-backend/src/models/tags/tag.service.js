const tagRepository = require('./tag.repository');
const productRepository = require("../product/product.repository");

// Создание тега
const createTag = async (name) => {
    if (!name || typeof name !== 'string') {
        throw new Error('Invalid tag name');
    }
    return await tagRepository.createTag(name);
};

// Обновление тега
const updateTag = async (id, name) => {
    if (!name || typeof name !== 'string') {
        throw new Error('Invalid tag name');
    }
    await tagRepository.updateTag(id, name);
};

// Удаление тега
const deleteTag = async (id) => {
    await tagRepository.deleteTag(id);
};

// Получение всех тегов
const getAllTags = async () => {
    return await tagRepository.getAllTags();
};
const searchTags = async (searchTerm) => {
    const tags = await tagRepository.searchTagsByName(searchTerm);
    return tags;
};
module.exports = {
    createTag,
    updateTag,
    deleteTag,
    getAllTags,
    searchTags
};
