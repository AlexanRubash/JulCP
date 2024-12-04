const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');
const { generateAccessToken, generateRefreshToken } = require('../../shared/utils/tokenUtils');
const jwt = require('jsonwebtoken');

const registerUser = async (username, password, role = 'user') => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return userRepository.createUser(username, hashedPassword, role);
};

const loginUser = async (username, password) => {
    const user = await userRepository.findUserByUsername(username);
    if (user && await bcrypt.compare(password, user.password_hash)) {
        const accessToken = generateAccessToken({ user_id: user.user_id, role: user.role });
        const refreshToken = generateRefreshToken({ user_id: user.user_id, role: user.role });
        await userRepository.saveRefreshToken(refreshToken, user.user_id);
        return { accessToken, refreshToken };
    }
    throw new Error('Invalid credentials');
};
const logoutUser = async (token) => {
    const storedToken = await userRepository.findRefreshToken(token);
    if (!storedToken) {
        throw new Error('Invalid refresh token');
    }
    await userRepository.deleteRefreshToken(token);
};

const refreshAccessToken = async (token) => {
    const storedToken = await userRepository.findRefreshToken(token);
    if (!storedToken) {
        throw new Error('Invalid refresh token');
    }
    const user = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return generateAccessToken({ user_id: user.user_id, role: user.role });
};

// Функции для работы с рецептами
const createRecipe = async (recipeData, userId) => {
    return await userRepository.createUserRecipe(recipeData, userId);
};

const updateRecipe = async (recipeId, recipeData, userId) => {
    return await userRepository.updateUserRecipe(recipeId, recipeData, userId);
};

const deleteRecipe = async (recipeId, userId) => {
    return await userRepository.deleteUserRecipe(recipeId, userId);
};

const addFavoriteRecipe = async (userId, recipeId) => {
    return await userRepository.addFavoriteRecipe(userId, recipeId);
};

const removeFavoriteRecipe = async (userId, recipeId) => {
    return await userRepository.removeFavoriteRecipe(userId, recipeId);
};

// Функции для работы с продуктами
const createProduct = async (productData, userId) => {
    return await userRepository.createUserProduct(productData, userId);
};

const updateProduct = async (productId, productData, userId) => {
    return await userRepository.updateUserProduct(productId, productData, userId);
};

const deleteProduct = async (productId, userId) => {
    return await userRepository.deleteUserProduct(productId, userId);
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    addFavoriteRecipe,
    removeFavoriteRecipe,
    createProduct,
    updateProduct,
    deleteProduct,
};