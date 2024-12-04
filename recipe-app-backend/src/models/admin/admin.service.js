const adminRepository = require('./admin.repository');
const bcrypt = require('bcryptjs');

// Логика для рецептов
const createRecipe = async (recipeData) => {
    return await adminRepository.createRecipe(recipeData);
};

const updateRecipe = async (id, recipeData) => {
    await adminRepository.updateRecipe(id, recipeData);
};

const deleteRecipe = async (id) => {
    await adminRepository.deleteRecipe(id);
};

// Логика для пользователей
const createUser = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await adminRepository.createUser({ ...userData, password: hashedPassword });
};

const updateUser = async (id, userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await adminRepository.updateUser(id, { ...userData, password: hashedPassword });
};

const deleteUser = async (id) => {
    await adminRepository.deleteUser(id);
};

// Логика для продуктов
const createProduct = async (productData) => {
    return await adminRepository.createProduct(productData);
};

const updateProduct = async (id, productData) => {
    await adminRepository.updateProduct(id, productData);
};

const deleteProduct = async (id) => {
    await adminRepository.deleteProduct(id);
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
