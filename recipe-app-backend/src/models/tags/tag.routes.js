const express = require('express');
const tagController = require('./tag.controller');
const { authenticateToken, authorizeRole } = require('../../shared/middlewares/authMiddleware');
const productController = require("../product/product.controller");

const router = express.Router();

// Получить все теги (для всех пользователей)
router.get('/', authenticateToken, tagController.getAllTags);

// Создать тег (только админ)
router.post('/',  authenticateToken, authorizeRole('admin'), tagController.createTag);

// Обновить тег (только админ)
router.put('/:id',  authenticateToken, authorizeRole('admin'), tagController.updateTag);

// Удалить тег (только админ)
router.delete('/:id',  authenticateToken, authorizeRole('admin'), tagController.deleteTag);
router.get('/search', authenticateToken, tagController.searchTagByName);

module.exports = router;
