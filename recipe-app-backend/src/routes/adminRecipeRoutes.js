const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminUserController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Проверка на токен и роль 'admin' на всех маршрутах для рецептов и пользователей
router.post('/create/recipe', authenticateToken, authorizeRole('admin'), adminController.createRecipe);
router.put('/update/recipe/:id', authenticateToken, authorizeRole('admin'), adminController.updateRecipe);
router.delete('/delete/recipe/:id', authenticateToken, authorizeRole('admin'), adminController.deleteRecipe);

// Маршруты для создания, обновления и удаления пользователей
router.post('/create/user', authenticateToken, authorizeRole('admin'), adminController.createUser);
router.put('/update/user/:id', authenticateToken, authorizeRole('admin'), adminController.updateUser);
router.delete('/delete/user/:id', authenticateToken, authorizeRole('admin'), adminController.deleteUser);

// Создание нового продукта
router.post('/create/product', authenticateToken, authorizeRole('admin'), adminController.createProduct);
// Обновление существующего продукта
router.put('/update/product/:id', authenticateToken, authorizeRole('admin'), adminController.updateProduct);
// Удаление продукта
router.delete('/delete/product/:id', authenticateToken, authorizeRole('admin'), adminController.deleteProduct);

module.exports = router;
