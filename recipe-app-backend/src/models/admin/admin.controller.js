const adminService = require('./admin.service');
const repository = require("./admin.repository");

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
const getProducts = async (req, res) => {

    try {
        const products = await repository.getProducts(); // Получаем ID пользователя из токена
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await repository.getProductById(req.params.id); // Получаем ID продукта из параметров
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving product' });
    }
};

// Методы для работы с категориями
const getCategories = async (req, res) => {
    try {
        const categories = await repository.getCategories(); // Получаем все категории
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving categories' });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await repository.getCategoryById(req.params.id); // Получаем категорию по ID
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving category' });
    }
};

const createCategory = async (req, res) => {
    const { name } = req.body; // Получаем имя категории из тела запроса
    try {
        const newCategory = await repository.createCategory(name); // Создаем категорию
        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating category' });
    }
};

const updateCategory = async (req, res) => {
    const { name } = req.body; // Получаем новое имя категории из тела запроса
    try {
        const updatedCategory = await repository.updateCategory(req.params.id, name); // Обновляем категорию по ID
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating category' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await repository.deleteCategory(req.params.id); // Удаляем категорию по ID
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(deletedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting category' });
    }
};
const getTags = async (req, res) => {
    try {
        const tags = await repository.getTags(); // Получаем все теги
        res.status(200).json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving tags' });
    }
};

const getTagById = async (req, res) => {
    try {
        const tag = await repository.getTagById(req.params.id); // Получаем тег по ID
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json(tag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving tag' });
    }
};

const createTag = async (req, res) => {
    const { name } = req.body; // Получаем имя тега из тела запроса
    try {
        const newTag = await repository.createTag(name); // Создаем тег
        res.status(201).json(newTag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating tag' });
    }
};

const updateTag = async (req, res) => {
    const { name } = req.body; // Получаем новое имя тега из тела запроса
    try {
        const updatedTag = await repository.updateTag(req.params.id, name); // Обновляем тег по ID
        if (!updatedTag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json(updatedTag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating tag' });
    }
};

const deleteTag = async (req, res) => {
    try {
        const deletedTag = await repository.deleteTag(req.params.id); // Удаляем тег по ID
        if (!deletedTag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json(deletedTag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting tag' });
    }
};
const getAllUsers = async (req, res) => {
    try {
        const users = await repository.getAllUsers();
        if (!users) {
            return res.status(404).json({ message: 'Users not found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting tag' });
    }
}
const getUserById = async (req, res) => {
    const id = req.params.id;
    try {
        const users = await repository.getUserById(id);
        if (!users) {
            return res.status(404).json({ message: 'Users not found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting tag' });
    }
}
const getUserRecipesAndProducts = async (req, res) => {
    const {id} = req.body;
    try {
        const users = await repository.getUserRecipesAndProducts(id);
        if (!users) {
            return res.status(404).json({ message: 'Users not found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting tag' });
    }
}
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
    getProductById,
    getProducts,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    getAllUsers,
    getUserRecipesAndProducts,
    getUserById
};

