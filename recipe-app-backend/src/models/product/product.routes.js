const express = require('express');
const productController = require('./product.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Получение всех продуктов
router.get('/', productController.getAllProducts);

// Поиск продуктов
router.get('/search', authenticateToken, productController.searchProducts);

module.exports = router;
