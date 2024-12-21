const userService = require('./user.service');

/**
 * Регистрация нового пользователя
 */
const registerUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        await userService.registerUser(username, password, role);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

/**
 * Авторизация пользователя
 */
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const tokens = await userService.loginUser(username, password);
        res.json(tokens);
    } catch (error) {
        console.error(error);
        if (error.message === 'Invalid credentials') {
            res.status(401).json({ message: 'Invalid username or password' });
        } else {
            res.status(500).json({ message: 'Error logging in' });
        }
    }
};

/**
 * Обновление access-токена
 */
const refreshAccessToken = async (req, res) => {
    try {
        const { token } = req.body;
        const newAccessToken = await userService.refreshAccessToken(token);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error(error);
        if (error.message === 'Invalid refresh token') {
            res.status(403).json({ message: 'Invalid refresh token' });
        } else {
            res.status(500).json({ message: 'Error refreshing token' });
        }
    }
};
const logoutUser = async (req, res) => {
    const token = req.body.refreshToken; // Получите refresh-токен из тела запроса
    if (!token) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        await userService.logoutUser(token);
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const repository = require('./user.repository');

const createRecipe = async (req, res) => {
    try {
        const userId = req.user.user_id; // Получение идентификатора пользователя из токена
        const recipeId = await userService.createRecipe(req.body, userId);
        res.status(201).json({ recipeId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



const updateRecipe = async (req, res) => {
    try {
        await repository.updateUserRecipe(req.params.id, req.body, req.user.user_id);
        res.status(200).json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const deleteRecipe = async (req, res) => {
    try {
        await repository.deleteUserRecipe(req.params.id, req.user.user_id);
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
const getFavoriteRecipes = async (req, res) => {
    try {
        const recipes = await repository.getFavoriteRecipes(req.user.user_id);
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving favorite recipes' });
    }
};

const getUserRecipes = async (req, res) => {
    try {
        const recipes = await repository.getUserRecipes(req.user.user_id);
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving favorite recipes' });
    }
};

const addFavoriteRecipe = async (req, res) => {
    try {
        await repository.addFavoriteRecipe(req.user.user_id, req.params.recipeId);
        res.status(200).json({ message: 'Recipe added to favorites' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding favorite recipe' });
    }
};

const removeFavoriteRecipe = async (req, res) => {
    try {
        await repository.removeFavoriteRecipe(req.user.user_id, req.params.recipeId);
        res.status(200).json({ message: 'Recipe removed from favorites' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error removing favorite recipe' });
    }
};

const createProduct = async (req, res) => {
    try {
        const productId = await repository.createUserProduct(req.body, req.user.user_id);
        res.status(201).json({ message: 'Product created successfully', productId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

const updateProduct = async (req, res) => {
    try {
        await repository.updateUserProduct(req.params.id, req.body, req.user.user_id);
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating product' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await repository.deleteUserProduct(req.params.id, req.user.user_id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};
const getUserProducts = async (req, res) => {
    try {
        const products = await repository.getUserProducts(req.user.user_id); // Получаем ID пользователя из токена
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
};

const getUserProductById = async (req, res) => {
    try {
        const product = await repository.getUserProductById(req.params.id, req.user.user_id); // Получаем ID продукта из параметров
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving product' });
    }
};

module.exports = {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getUserProducts,
    getUserProductById,
    logoutUser,
    addFavoriteRecipe,
    removeFavoriteRecipe,
    createProduct,
    updateProduct,
    deleteProduct,
    registerUser, loginUser, refreshAccessToken, getFavoriteRecipes,getUserRecipes
};