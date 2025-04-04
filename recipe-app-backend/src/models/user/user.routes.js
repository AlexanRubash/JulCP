const express = require('express');
const userController = require('./user.controller');
const { authenticateToken, authorizeRole } = require('../../shared/middlewares/authMiddleware');
const router = express.Router();

// Маршруты для регистрации, авторизации и обновления токенов
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/refresh-token', userController.refreshAccessToken);
router.post('/logout', authenticateToken, userController.logoutUser);


// Маршруты для работы с рецептами
router.post('/recipes', authenticateToken, authorizeRole('user'), userController.createRecipe); // Создание рецепта
router.get('/recipes', authenticateToken, authorizeRole('user'), userController.getUserRecipes);
router.put('/recipes/:id', authenticateToken, authorizeRole('user'), userController.updateRecipe); // Обновление рецепта
router.delete('/recipes/:id', authenticateToken, authorizeRole('user'), userController.deleteRecipe); // Удаление рецепта

// Управление избранными рецептами
router.get('/favorites', authenticateToken, authorizeRole('user'), userController.getFavoriteRecipes); // Получить избранные рецепты
router.post('/favorites/:recipeId', authenticateToken, authorizeRole('user'), userController.addFavoriteRecipe); // Добавить в избранное
router.delete('/favorites/:recipeId', authenticateToken, authorizeRole('user'), userController.removeFavoriteRecipe); // Удалить из избранного

// Маршруты для работы с продуктами
router.get('/products', authenticateToken, authorizeRole('user'), userController.getUserProducts); // Получение всех продуктов пользователя
router.get('/products/:id', authenticateToken, authorizeRole('user'), userController.getUserProductById); // Получение конкретного продукта пользователя
router.post('/products', authenticateToken, authorizeRole('user'), userController.createProduct); // Создание продукта
router.put('/products/:id', authenticateToken, authorizeRole('user'), userController.updateProduct); // Обновление продукта
router.delete('/products/:id', authenticateToken, authorizeRole('user'), userController.deleteProduct); // Удаление продукта


module.exports = router;
