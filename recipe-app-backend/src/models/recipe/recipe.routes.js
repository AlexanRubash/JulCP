const express = require('express');
const router = express.Router();
const recipeController = require('./recipe.controller');
const { authenticateToken, authorizeRole } = require('../../shared/middlewares/authMiddleware');

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

// Новый маршрут для получения рецепта по имени
router.get('/name/:name', authenticateToken, recipeController.getRecipeByName);

// Новый маршрут для получения рецептов по тегу
router.post('/tags', authenticateToken, recipeController.getRecipesByTags);

module.exports = router;
