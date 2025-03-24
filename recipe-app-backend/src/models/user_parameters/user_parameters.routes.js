const express = require('express');
const userParametersController = require('./user_parameters.controller');
const { authenticateToken } = require('../../shared/middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, userParametersController.getUserParameters);
router.put('/', authenticateToken, userParametersController.updateUserParameters);
router.post('/', authenticateToken, userParametersController.createUserParameters);

module.exports = router;
