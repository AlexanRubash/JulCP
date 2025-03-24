const userParametersService = require('./user_parameters.service');

// Получение параметров пользователя
const getUserParameters = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const parameters = await userParametersService.getUserParameters(userId);
        res.json(parameters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user parameters' });
    }
};

// Обновление параметров пользователя
const updateUserParameters = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const params = req.body;
        await userParametersService.updateUserParameters(userId, params);
        res.json({ message: 'User parameters updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user parameters' });
    }
};
// Создание параметров пользователя
const createUserParameters = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const createdParams = await userParametersService.createUserParameters(userId, req.body);
        res.status(201).json({ message: 'User parameters created successfully', createdParams });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user parameters' });
    }
};

module.exports = {
    getUserParameters,
    updateUserParameters,
    createUserParameters
};