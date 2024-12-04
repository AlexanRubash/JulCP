const adminService = require('./admin.service');

// Контроллеры для рецептов
const createRecipe = async (req, res) => {
    try {
        const recipeId = await adminService.createRecipe(req.body);
        res.status(201).json({ message: 'Recipe created successfully', recipeId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateRecipe = async (req, res) => {
    try {
        await adminService.updateRecipe(req.params.id, req.body);
        res.status(200).json({ message: 'Recipe updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteRecipe = async (req, res) => {
    try {
        await adminService.deleteRecipe(req.params.id);
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Контроллеры для пользователей
const createUser = async (req, res) => {
    try {
        await adminService.createUser(req.body);
        res.status(201).send('User registered');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
};

const updateUser = async (req, res) => {
    try {
        await adminService.updateUser(req.params.id, req.body);
        res.status(200).send('User updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user');
    }
};

const deleteUser = async (req, res) => {
    try {
        await adminService.deleteUser(req.params.id);
        res.status(200).send('User deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
    }
};

// Контроллеры для продуктов
const createProduct = async (req, res) => {
    try {
        const productId = await adminService.createProduct(req.body);
        res.status(201).json({ message: 'Product created successfully', productId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        await adminService.updateProduct(req.params.id, req.body);
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await adminService.deleteProduct(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createRecipe,
    updateRecipe,
    deleteRecipe,
    createUser,
    updateUser,
    deleteUser,
    createProduct,
    updateProduct,
    deleteProduct,
};
