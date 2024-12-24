const express = require('express');
const productController = require('./product.controller');
const { authenticateToken, authorizeRole } = require('../../shared/middlewares/authMiddleware');
const adminController = require("../admin/admin.controller");

const router = express.Router();

// Получение всех продуктов
router.get('/', productController.getAllProducts);

// Поиск продуктов
router.get('/search', authenticateToken, productController.searchProducts);
router.get('/products', authenticateToken, productController.getProducts); // Получение всех продуктов
router.get('/categories', authenticateToken, productController.getCategories); // Получение всех категорий
router.get('/products/:id', authenticateToken, productController.getProductById); // Получение конкретного продукта
router.get('/recipes/:id', authenticateToken, productController.getRecipesByProduct);

module.exports = router;
