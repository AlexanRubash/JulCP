import React, { useState, useEffect } from 'react';
import { fetchUserProducts, deleteUserProduct, updateUserProduct, createUserProduct } from '../../api';

const UserProductPage = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false); // Состояние для отображения формы добавления продукта
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        category_id: '', // Сюда можно передавать пустую строку, если категория не обязательна
    });

    // Функция для загрузки всех продуктов
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchUserProducts(token);
                setProducts(data);
            } catch (error) {
                console.error('Error loading products:', error);
            }
        };

        loadProducts();
    }, [token]);

    // Фильтрация продуктов по поисковому запросу
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Открыть форму для редактирования продукта
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsEditing(true);
    };

    // Удалить продукт
    const handleDelete = async (productId) => {
        try {
            await deleteUserProduct(productId, token);
            setProducts((prevProducts) =>
                prevProducts.filter((product) => product.product_id !== productId)
            );
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    // Обновить продукт
    const handleUpdate = async (updatedProduct) => {
        try {
            await updateUserProduct(updatedProduct, token);
            const updatedProducts = await fetchUserProducts(token);
            setProducts(updatedProducts);
            setIsEditing(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    // Открыть форму для добавления нового продукта
    const handleAddProduct = () => {
        setIsAdding(true);
    };

    // Сохранить новый продукт
    const handleCreateProduct = async () => {
        try {
            const productData = {
                name: newProduct.name,
                description: newProduct.description,
                category_id: newProduct.category_id || null, // Передаем null, если категория не указана
            };

            // Создаем продукт через API
            const newProductResponse = await createUserProduct(productData, token);

            // После создания нового продукта обновляем список продуктов
            const updatedProducts = await fetchUserProducts(token);
            setProducts(updatedProducts);

            // Сброс состояния и закрытие формы
            setIsAdding(false);
            setNewProduct({
                name: '',
                description: '',
                category_id: '', // Сбросить поле категории
            });
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    return (
        <div className="user-product-page">
            <h1>Мои продукты</h1>
            <input
                type="text"
                placeholder="Поиск продуктов..."
                value={searchQuery}
                onChange={handleSearch}
            />

            {/* Кнопка "Добавить продукт" */}
            <button onClick={handleAddProduct}>Добавить продукт</button>

            {/* Форма для добавления нового продукта */}
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

                        {/* Кнопки для редактирования и удаления */}
                        <button onClick={() => handleEdit(product)}>Изменить</button>
                        <button onClick={() => handleDelete(product.product_id)}>Удалить</button>

                        {/* Форма редактирования появляется только для выбранного продукта */}
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

export default UserProductPage;
