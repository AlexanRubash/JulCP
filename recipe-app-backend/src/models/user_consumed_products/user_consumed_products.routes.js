const express = require('express');
const userConsumedProductsController = require('./user_consumed_products.controller');
const { authenticateToken } = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

// Добавление потребленного продукта
router.post('/', authenticateToken, userConsumedProductsController.addConsumedItem);


router.post('/date', authenticateToken, userConsumedProductsController.getConsumedItemsByDate);

// Удаление потребленного продукта
router.delete('/:id', authenticateToken, userConsumedProductsController.deleteConsumedItem);

module.exports = router;
