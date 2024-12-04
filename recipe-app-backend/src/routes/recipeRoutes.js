const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Применение middleware для проверки токена на каждом маршруте
router.get('/:id', authenticateToken, recipeController.getRecipeById);
router.post('/exact', authenticateToken, recipeController.getRecipesByExactProducts);
router.post('/partial', authenticateToken, recipeController.getRecipesByPartialProducts);

module.exports = router;
