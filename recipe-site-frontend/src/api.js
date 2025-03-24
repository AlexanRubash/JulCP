// src/api.js
import header from "./components/user/Header";

const API_URL = 'http://localhost:5000/api'; // Adjust this URL to match your backend server

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (response.ok) {
            const data = await response.json();
            return data.accessToken; // Убедитесь, что бэкенд возвращает это поле
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Error registering user:', error);
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        if (response.ok) {
            const data = await response.json();
            return data.accessToken; // Убедитесь, что бэкенд возвращает это поле
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};
export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await fetch(`${API_URL}/users/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: refreshToken }),
        });
        if (response.ok) {
            const data = await response.json();
            return data.accessToken;
        } else {
            throw new Error('Failed to refresh access token');
        }
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
};

export const fetchRecipeById = async (id, token) => {
    try {
        const response = await fetch(`${API_URL}/recipes/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to fetch recipe');
        }
    } catch (error) {
        console.error('Error fetching recipe by ID:', error);
        throw error;
    }
};


// Функция для точного поиска
export const searchExactRecipes = async (searchText, token, limit = 10, offset = 0) => {
    try {
        const response = await fetch(`${API_URL}/recipes/exact/from-string`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ products: searchText, limit, offset }),
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data)
            return data; // возвращаем найденные рецепты
        } else {
            throw new Error('Failed to fetch exact recipes');
        }
    } catch (error) {
        console.error('Error fetching exact recipes:', error);
        throw error;
    }
};

// Функция для частичного поиска
export const searchPartialRecipes = async (searchText, token, limit = 10, offset = 0) => {
    try {
        const response = await fetch(`${API_URL}/recipes/partial/from-string`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ products: searchText, limit, offset }),
        });
        if (response.ok) {
            const data = await response.json();
            return data; // возвращаем найденные рецепты
        } else {
            throw new Error('Failed to fetch partial recipes');
        }
    } catch (error) {
        console.error('Error fetching partial recipes:', error);
        throw error;
    }
};
// src/api.js
export const logoutUser = async (token) => {
    try {
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: token }),
        });
        if (response.ok) {
            return 'Logged out successfully';
        } else {
            throw new Error('Failed to log out');
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};
export const uploadImage = async (file, folder, token, recipeId, stepNumber = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('recipeId', recipeId);
    if (stepNumber !== null) {
        formData.append('stepNumber', stepNumber);
    }

    const response = await fetch(`${API_URL}/uploads`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
};


export const createRecipe = async (recipeData, token) => {
    const response = await fetch(`${API_URL}/users/recipes`, {
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

export const fetchProducts = async (searchTerm = '', token) => {
    console.log('token', token);
    const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(searchTerm)}`, {
            headers: {'Authorization': `Bearer ${token}`}
    });
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    const data = await response.json();

    // Добавьте проверку структуры данных
    if (!Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        return [];
    }

    return data; // Ожидается массив объектов { id, name }
};


export const fetchTags = async (searchTerm = '', token) => {
    const response = await fetch(`${API_URL}/tags/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {'Authorization': `Bearer ${token}`}
    });
    if (!response.ok) {
        throw new Error('Failed to fetch tags');
    }
    const data = await response.json();

    // Добавьте проверку структуры данных
    if (!Array.isArray(data)) {
        console.error("Unexpected data format:", data);
        return [];
    }
    return data; // Ожидается массив объектов { id, name }
};

export const updateRecipe = async (id, updatedData, token) => {
    try {
        const response = await fetch(`${API_URL}/users/recipes/${id}`, {
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


export const searchRecipesByTags = async (tags, token, limit = 10, offset = 0) => {
    try {
        console.log(tags);
        const response = await fetch(`${API_URL}/recipes/tags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ tags, limit, offset }), // Передаем параметры limit и offset
        });
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        console.log(data);
        return data || [];
    } catch (error) {
        console.error('Error searching recipes by tags:', error);
        throw error;
    }
};

export const searchRecipesByName = async (name, token) => {
    try {
        const response = await fetch(`${API_URL}/recipes/name/${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            return await response.json(); // Возвращаем данные
        } else {
            throw new Error('Failed to fetch recipes by name');
        }
    } catch (error) {
        console.error('Error fetching recipes by name:', error);
        throw error;
    }
};
export const fetchAllRecipes = async (token, targetCalories, targetProtein, targetFat) => {
    try {
        const url = new URL(`${API_URL}/recipes/all`);
        // Добавляем параметры в URL
        url.searchParams.append('target_calories', targetCalories);
        url.searchParams.append('target_protein', targetProtein);
        url.searchParams.append('target_fat', targetFat);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch filtered recipes');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching filtered recipes:', error);
        throw error;
    }
};
// api.js

// Функция для добавления рецепта в избранное
export const addFavorite = async (id, token) => {
    try {
        const response = await fetch(`http://localhost:5000/api/users/favorites/${id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to add recipe to favorites');
        }

        const data = await response.json();
        return data.message; // Сообщение об успехе
    } catch (err) {
        throw new Error(err.message); // Ошибка
    }
};

// Функция для удаления рецепта из избранного
export const removeFavorite = async (id, token) => {
    try {
        const response = await fetch(`http://localhost:5000/api/users/favorites/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to remove recipe from favorites');
        }

        const data = await response.json();
        return data.message; // Сообщение об успехе
    } catch (err) {
        throw new Error(err.message); // Ошибка
    }
};

// Функция для получения информации о рецепте
export const fetchRecipe = async (id, token) => {
    try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recipe');
        }

        return await response.json(); // Данные о рецепте
    } catch (err) {
        throw new Error(err.message); // Ошибка
    }
};
// Функция для получения избранных рецептов
export const fetchFavorites = async (token) => {
    try {
        const response = await fetch('http://localhost:5000/api/users/favorites', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch favorite recipes');
        }

        return await response.json(); // Возвращаем данные о избранных рецептах
    } catch (err) {
        throw new Error(err.message); // Ошибка
    }
};
// src/api.js
export const fetchUserProducts = async (token) => {
    try {
        const response = await fetch(`${API_URL}/users/products`, {
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
// src/api.js

export const deleteUserProduct = async (productId, token) => {
    try {
        const response = await fetch(`${API_URL}/users/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
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

export const updateUserProduct = async (product, token) => {
    try {
        const response = await fetch(`${API_URL}/users/products/${product.product_id}`, {
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
export const createUserProduct = async (productData, token) => {
    try {
        const response = await fetch(`${API_URL}/users/products`, {
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
export const deleteUserRecipe = async (recipeId, token) => {
    try {
        const response = await fetch(`${API_URL}/users/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to delete recipe');
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
};
export const createUserParameters = async (parameters, token) => {
    try {
        const response = await fetch(`${API_URL}/user-parameters/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(parameters),
        });

        if (!response.ok) {
            throw new Error('Ошибка при создании параметров пользователя');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при создании параметров пользователя:', error);
        throw error;
    }
};
export const getUserParameters = async ( token) => {
    try {
        const response = await fetch(`${API_URL}/user-parameters/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении параметров пользователя');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении параметров пользователя:', error);
        throw error;
    }
};
// Получение списка нежелательных продуктов пользователя
export const getUserUnwantedProducts = async (token) => {
    try {
        const response = await fetch(`${API_URL}/user-unwanted-products/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch unwanted products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching unwanted products:', error);
        throw error;
    }
};

// Добавление нежелательного продукта
export const addUserUnwantedProduct = async (userId, productId, token) => {
    try {
        const response = await fetch(`${API_URL}/user-unwanted-products/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to add unwanted product');
        return await response.json();
    } catch (error) {
        console.error('Error adding unwanted product:', error);
        throw error;
    }
};

// Удаление нежелательного продукта
export const removeUserUnwantedProduct = async (userId, productId, token) => {
    try {
        const response = await fetch(`${API_URL}/user-unwanted-products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) throw new Error('Failed to remove unwanted product');
        return await response.json();
    } catch (error) {
        console.error('Error removing unwanted product:', error);
        throw error;
    }
};
// Добавление съеденного продукта
export const addConsumedProduct = async (productData, token) => {
    try {
        const response = await fetch(`${API_URL}/user-consumed-products/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) throw new Error('Ошибка при добавлении продукта');
        return await response.json();
    } catch (error) {
        console.error('Ошибка при добавлении съеденного продукта:', error);
        throw error;
    }
};
// Добавление съеденного рецепта
export const addConsumedRecipe = async (recipeData, token) => {
    try {
        const response = await fetch(`${API_URL}/user-consumed-products/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recipeData),
        });

        if (!response.ok) throw new Error('Ошибка при добавлении рецепта');
        return await response.json();
    } catch (error) {
        console.error('Ошибка при добавлении съеденного рецепта:', error);
        throw error;
    }
};

// Получение съеденных продуктов за дату (POST-запрос, передаем дату в body)
export const getConsumedProductsByDate = async (date, token) => {
    try {
        const response = await fetch(`${API_URL}/user-consumed-products/date`, {
            method: 'POST', // Теперь используем POST
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date }) // Передаем дату в body
        });

        if (!response.ok) throw new Error('Ошибка при получении продуктов');
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении съеденных продуктов:', error);
        throw error;
    }
};


// Удаление съеденного продукта
export const deleteConsumedProduct = async (productId, token) => {
    try {
        const response = await fetch(`${API_URL}/user-consumed-products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Ошибка при удалении продукта');
        return await response.json();
    } catch (error) {
        console.error('Ошибка при удалении съеденного продукта:', error);
        throw error;
    }
};
