import React, { useState, useEffect } from 'react';
import { fetchAdminCategories, deleteAdminCategory, updateAdminCategory, createAdminCategory } from '../../api/adminApi';

const AdminCategoryPage = ({ token }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
    });

    // Загрузка категорий для администратора
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchAdminCategories(token);
                setCategories(data);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };

        loadCategories();
    }, [token]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setIsEditing(true);
    };

    const handleDelete = async (categoryId) => {
        try {
            await deleteAdminCategory(categoryId, token);
            setCategories((prevCategories) =>
                prevCategories.filter((category) => category.category_id !== categoryId)
            );
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const handleUpdate = async (updatedCategory) => {
        try {
            await updateAdminCategory(updatedCategory.category_id, updatedCategory, token);
            const updatedCategories = await fetchAdminCategories(token);
            setCategories(updatedCategories);
            setIsEditing(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    const handleAddCategory = () => {
        setIsAdding(true);
    };

    const handleCreateCategory = async () => {
        try {
            const categoryData = {
                name: newCategory.name,
            };

            await createAdminCategory(categoryData, token);
            const updatedCategories = await fetchAdminCategories(token);
            setCategories(updatedCategories);

            setIsAdding(false);
            setNewCategory({ name: '' });
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    return (
        <div className="admin-category-page">
            <h1>Управление категориями</h1>
            <input
                type="text"
                placeholder="Поиск категорий..."
                value={searchQuery}
                onChange={handleSearch}
            />

            <button onClick={handleAddCategory}>Добавить категорию</button>

            {isAdding && (
                <div className="add-category-form">
                    <h2>Добавить новую категорию</h2>
                    <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Название категории"
                    />
                    <button onClick={handleCreateCategory}>Добавить</button>
                    <button onClick={() => setIsAdding(false)}>Отмена</button>
                </div>
            )}

            <div className="category-list">
                {filteredCategories.map((category) => (
                    <div key={category.category_id} className="category-item">
                        <h3>{category.name}</h3>

                        <button onClick={() => handleEdit(category)}>Изменить</button>
                        <button onClick={() => handleDelete(category.category_id)}>Удалить</button>

                        {isEditing && selectedCategory && selectedCategory.category_id === category.category_id && (
                            <div className="edit-form">
                                <h2>Изменить категорию</h2>
                                <input
                                    type="text"
                                    value={selectedCategory.name}
                                    onChange={(e) =>
                                        setSelectedCategory({ ...selectedCategory, name: e.target.value })
                                    }
                                    placeholder="Название"
                                />
                                <button onClick={() => handleUpdate(selectedCategory)}>Сохранить</button>
                                <button onClick={() => setIsEditing(false)}>Отмена</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCategoryPage;
