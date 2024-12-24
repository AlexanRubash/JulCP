const API_URL = 'http://localhost:5000/api';
export const fetchTagById = async (productId, token) => {
    const response = await fetch(`${API_URL}/admin/tags/${productId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch product');
    }
    return await response.json();
};