const express = require('express');
const router = express.Router();
const recipeController = require('./recipe.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Маршрут для получения данных рецепта по его ID
router.get('/:id', authenticateToken, recipeController.getRecipeById);

// Маршрут для получения рецептов по точному совпадению продуктов
router.post('/exact', authenticateToken, recipeController.getRecipesByExactProducts);

// Маршрут для получения рецептов по частичному совпадению продуктов
router.post('/partial', authenticateToken, recipeController.getRecipesByPartialProducts);

// Маршрут для получения рецептов по точному совпадению продуктов из строки
router.post('/exact/from-string', authenticateToken, recipeController.getRecipesByExactProductsFromString);

// Маршрут для получения рецептов по частичному совпадению продуктов из строки
router.post('/partial/from-string', authenticateToken, recipeController.getRecipesByPartialProductsFromString);

module.exports = router;
