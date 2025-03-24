const userParametersRepository = require('./user_parameters.repository');

const getUserParameters = async (userId) => {
    return await userParametersRepository.getUserParameters(userId);
};

const updateUserParameters = async (userId, params) => {
    await userParametersRepository.updateUserParameters(userId, params);
};
const createUserParameters = async (userId, params) => {
    return await userParametersRepository.createUserParameters(userId, params);
};

module.exports = {
    getUserParameters,
    updateUserParameters,
    createUserParameters
};
