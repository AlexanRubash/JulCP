const express = require('express');
const userUnwantedProductsController = require('./user_unwanted_products.controller');
const { authenticateToken } = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, userUnwantedProductsController.getUserUnwantedProducts);
router.post('/:id', authenticateToken, userUnwantedProductsController.addUserUnwantedProduct);
router.delete('/:id', authenticateToken, userUnwantedProductsController.removeUserUnwantedProduct);

module.exports = router;
