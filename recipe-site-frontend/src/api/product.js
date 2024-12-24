const API_URL = 'http://localhost:5000/api/products';

export const fetchProducts = async (token) => {
    try {
        const response = await fetch(`${API_URL}/products`, {
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
export const fetchCategories = async (token) => {
    try {
        const response = await fetch(`${API_URL}/categories`, {
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
// fetchProductById.js
export const fetchProductById = async (productId, token) => {
    const response = await fetch(`${API_URL}/products/${productId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }
    return await response.json();
};

// fetchRecipesByProductId.js
export const fetchRecipesByProductId = async (productId, token) => {
    const response = await fetch(`${API_URL}/recipes/${productId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch recipes');
    }
    return await response.json();
};
