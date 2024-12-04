const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticateToken, authorizeRole } = require('../../middleware/authMiddleware');

// Маршруты для управления рецептами
router.post('/recipes', authenticateToken, authorizeRole('admin'), adminController.createRecipe);
router.put('/recipes/:id', authenticateToken, authorizeRole('admin'), adminController.updateRecipe);
router.delete('/recipes/:id', authenticateToken, authorizeRole('admin'), adminController.deleteRecipe);

// Маршруты для управления пользователями
router.post('/users', authenticateToken, authorizeRole('admin'), adminController.createUser);
router.put('/users/:id', authenticateToken, authorizeRole('admin'), adminController.updateUser);
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), adminController.deleteUser);

// Маршруты для управления продуктами
router.post('/products', authenticateToken, authorizeRole('admin'), adminController.createProduct);
router.put('/products/:id', authenticateToken, authorizeRole('admin'), adminController.updateProduct);
router.delete('/products/:id', authenticateToken, authorizeRole('admin'), adminController.deleteProduct);

module.exports = router;
