import React, { useState, useEffect } from 'react';
import { fetchAdminProducts, deleteAdminProduct, updateAdminProduct, createAdminProduct } from '../../api/adminApi';

const AdminProductPage = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        category_id: '',
    });

    // Загрузка продуктов для администратора
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchAdminProducts(token);
                setProducts(data);
            } catch (error) {
                console.error('Error loading products:', error);
            }
        };

        loadProducts();
    }, [token]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsEditing(true);
    };

    const handleDelete = async (productId) => {
        try {
            await deleteAdminProduct(productId, token);
            setProducts((prevProducts) =>
                prevProducts.filter((product) => product.product_id !== productId)
            );
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleUpdate = async (updatedProduct) => {
        try {
            await updateAdminProduct(updatedProduct, token);
            const updatedProducts = await fetchAdminProducts(token);
            setProducts(updatedProducts);
            setIsEditing(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const handleAddProduct = () => {
        setIsAdding(true);
    };

    const handleCreateProduct = async () => {
        try {
            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                category_id: newProduct.category_id || null,
            };

            await createAdminProduct(productData, token);
            const updatedProducts = await fetchAdminProducts(token);
            setProducts(updatedProducts);

            setIsAdding(false);
            setNewProduct({
                name: '',
                description: '',
                category_id: '',
            });
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    return (
        <div className="admin-product-page">
            <h1>Управление продуктами</h1>
            <input
                type="text"
                placeholder="Поиск продуктов..."
                value={searchQuery}
                onChange={handleSearch}
            />

            <button onClick={handleAddProduct}>Добавить продукт</button>

            {isAdding && (
                <div className="add-product-form">
                    <h2>Добавить новый продукт</h2>
                    <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Название продукта"
                    />
                    <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Описание"
                    />
                    <input
                        type="text"
                        value={newProduct.category_id}
                        onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                        placeholder="ID категории (необязательно)"
                    />
                    <button onClick={handleCreateProduct}>Добавить</button>
                    <button onClick={() => setIsAdding(false)}>Отмена</button>
                </div>
            )}

            <div className="product-list">
                {filteredProducts.map((product) => (
                    <div key={product.product_id} className="product-item">
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>

                        <button onClick={() => handleEdit(product)}>Изменить</button>
                        <button onClick={() => handleDelete(product.product_id)}>Удалить</button>

                        {isEditing && selectedProduct && selectedProduct.product_id === product.product_id && (
                            <div className="edit-form">
                                <h2>Изменить продукт</h2>
                                <input
                                    type="text"
                                    value={selectedProduct.name}
                                    onChange={(e) =>
                                        setSelectedProduct({ ...selectedProduct, name: e.target.value })
                                    }
                                    placeholder="Название"
                                />
                                <textarea
                                    value={selectedProduct.description}
                                    onChange={(e) =>
                                        setSelectedProduct({ ...selectedProduct, description: e.target.value })
                                    }
                                    placeholder="Описание"
                                />
                                <button onClick={() => handleUpdate(selectedProduct)}>Сохранить</button>
                                <button onClick={() => setIsEditing(false)}>Отмена</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminProductPage;
