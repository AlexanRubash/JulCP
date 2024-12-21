const API_URL = 'http://localhost:5000/api';
export const adminCreateRecipe = async (recipeData, token) => {
    const response = await fetch(`${API_URL}/admin/recipes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
    });

    if (!response.ok) {
        throw new Error('Failed to create recipe');
    }

    return await response.json();
};
export const adminUpdateRecipe = async (id, updatedData, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/recipes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error('Failed to update recipe');
        }

        return await response.json(); // Возвращаем обновленный рецепт
    } catch (error) {
        console.error('Error updating recipe:', error);
        throw error;
    }
};
export const adminDeleteRecipe = async (id, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/recipes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete recipe');
        }

        return await response.json(); // Опционально, если API возвращает подтверждение удаления
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
};
// src/adminApi.js

// Получение списка продуктов для администратора
export const fetchAdminProducts = async (token) => {
    try {
        const response = await fetch(`${API_URL}/admin/products`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Получение конкретного продукта по ID для администратора
export const fetchAdminProductById = async (productId, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch product by ID');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        throw error;
    }
};

// Удаление продукта для администратора
export const deleteAdminProduct = async (productId, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// Обновление продукта для администратора
export const updateAdminProduct = async (product, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/products/${product.product_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(product),
        });
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        return await response.json(); // Возвращаем обновленный продукт
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Создание нового продукта для администратора
export const createAdminProduct = async (productData, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData), // Отправляем данные нового продукта
        });

        if (!response.ok) {
            throw new Error('Failed to create product');
        }

        // Возвращаем данные созданного продукта, если нужно
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

// --- Категории ---

// Получение всех категорий
export const fetchAdminCategories = async (token) => {
    try {
        const response = await fetch(`${API_URL}/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

// Получение категории по ID
export const fetchAdminCategoryById = async (categoryId, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch category by ID');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        throw error;
    }
};

// Создание категории
export const createAdminCategory = async (categoryData, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
            throw new Error('Failed to create category');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

// Обновление категории
export const updateAdminCategory = async (categoryId, updatedData, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error('Failed to update category');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

// Удаление категории
export const deleteAdminCategory = async (categoryId, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

// --- Теги ---

// Получение всех тегов
export const fetchAdminTags = async (token) => {
    try {
        const response = await fetch(`${API_URL}/admin/tags`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch tags');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tags:', error);
        throw error;
    }
};

// Получение тега по ID
export const fetchAdminTagById = async (tagId, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/tags/${tagId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch tag by ID');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tag by ID:', error);
        throw error;
    }
};

// Создание тега
export const createAdminTag = async (tagData, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(tagData),
        });

        if (!response.ok) {
            throw new Error('Failed to create tag');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating tag:', error);
        throw error;
    }
};

// Обновление тега
export const updateAdminTag = async (tagId, updatedData, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/tags/${tagId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error('Failed to update tag');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating tag:', error);
        throw error;
    }
};

// Удаление тега
export const deleteAdminTag = async (tagId, token) => {
    try {
        const response = await fetch(`${API_URL}/admin/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to delete tag');
        }
    } catch (error) {
        console.error('Error deleting tag:', error);
        throw error;
    }
};
