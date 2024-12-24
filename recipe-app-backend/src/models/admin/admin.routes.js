const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticateToken, authorizeRole } = require('../../shared/middlewares/authMiddleware');

// Маршруты для управления рецептами
router.post('/recipes', authenticateToken, authorizeRole('admin'), adminController.createRecipe);
router.put('/recipes/:id', authenticateToken, authorizeRole('admin'), adminController.updateRecipe);
router.delete('/recipes/:id', authenticateToken, authorizeRole('admin'), adminController.deleteRecipe);

// Маршруты для управления пользователями
router.get('/users', authenticateToken, authorizeRole('admin'), adminController.getAllUsers); // Получение всех пользователей
router.get('/users/:id', authenticateToken, authorizeRole('admin'), adminController.getUserById); // Получение пользователя по ID
router.post('/users/recipes', authenticateToken, authorizeRole('admin'), adminController.getUserRecipesAndProducts); // Получение рецептов и продуктов пользователя
router.post('/users', authenticateToken, authorizeRole('admin'), adminController.createUser);
router.put('/users/:id', authenticateToken, authorizeRole('admin'), adminController.updateUser);
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), adminController.deleteUser);

// Маршруты для управления продуктами
router.post('/products', authenticateToken, authorizeRole('admin'), adminController.createProduct);
router.put('/products/:id', authenticateToken, authorizeRole('admin'), adminController.updateProduct);
router.delete('/products/:id', authenticateToken, authorizeRole('admin'), adminController.deleteProduct);
router.get('/products', authenticateToken, authorizeRole('admin'), adminController.getProducts); // Получение всех продуктов
router.get('/products/:id', authenticateToken, authorizeRole('admin'), adminController.getProductById); // Получение конкретного продукта

// Маршруты для управления категориями
router.post('/categories', authenticateToken, authorizeRole('admin'), adminController.createCategory); // Создание категории
router.put('/categories/:id', authenticateToken, authorizeRole('admin'), adminController.updateCategory); // Обновление категории
router.delete('/categories/:id', authenticateToken, authorizeRole('admin'), adminController.deleteCategory); // Удаление категории
router.get('/categories', authenticateToken, authorizeRole('admin'), adminController.getCategories); // Получение всех категорий
router.get('/categories/:id', authenticateToken, authorizeRole('admin'), adminController.getCategoryById); // Получение категории по ID

// Маршруты для управления тегами
router.post('/tags', authenticateToken, authorizeRole('admin'), adminController.createTag); // Создание тега
router.put('/tags/:id', authenticateToken, authorizeRole('admin'), adminController.updateTag); // Обновление тега
router.delete('/tags/:id', authenticateToken, authorizeRole('admin'), adminController.deleteTag); // Удаление тега
router.get('/tags', authenticateToken, authorizeRole('admin'), adminController.getTags); // Получение всех тегов
router.get('/tags/:id', authenticateToken, authorizeRole('admin'), adminController.getTagById); // Получение тега по ID

module.exports = router;
