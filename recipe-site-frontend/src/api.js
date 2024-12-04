// src/api.js
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
        return response.ok ? 'User registered successfully' : 'Failed to register user';
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

// Функция для точного поиска
export const searchExactRecipes = async (searchText, token, page = 1) => {
    try {
        const response = await fetch(`${API_URL}/recipes/exact/from-string`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ products: searchText, page }),
        });
        if (response.ok) {
            const data = await response.json();
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
export const searchPartialRecipes = async (searchText, token, page = 1) => {
    try {
        const response = await fetch(`${API_URL}/recipes/partial/from-string`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ products: searchText, page }),
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
