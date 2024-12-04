const express = require('express');
const userRoutes = require('./models/user/user.routes');  // Импортируем маршруты для пользователя
const recipeRoutes = require('./models/recipe/recipe.routes');  // Импортируем маршруты для рецептов
const authMiddleware = require('./shared/middlewares/authMiddleware');  // Импортируем middleware для авторизации
const adminRoutes = require('./models/admin/admin.routes');

const path = require('path'); // Понадобится для работы с путями
const router = express.Router();

// Настройка статического пути для изображений рецептов
router.use('/uploads/recipeImage', express.static(path.join(__dirname, 'uploads', 'recipeImage')));

// Настройка статического пути для изображений шагов
router.use('/uploads/stepsImage', express.static(path.join(__dirname, 'uploads', 'stepsImage')));

// Все маршруты для пользователя
router.use('/users', userRoutes);

// Все маршруты для рецептов
router.use('/recipes', recipeRoutes);

// Можно добавить дополнительные маршруты, например, для администраторов
router.use('/admin', adminRoutes);

module.exports = router;
