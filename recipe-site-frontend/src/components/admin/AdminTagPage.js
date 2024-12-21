import React, { useState, useEffect } from 'react';
import { fetchAdminTags, deleteAdminTag, updateAdminTag, createAdminTag } from '../../api/adminApi';

const AdminTagPage = ({ token }) => {
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newTag, setNewTag] = useState({
        name: '',
    });

    // Загрузка тегов для администратора
    useEffect(() => {
        const loadTags = async () => {
            try {
                const data = await fetchAdminTags(token);
                setTags(data);
            } catch (error) {
                console.error('Error loading tags:', error);
            }
        };

        loadTags();
    }, [token]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (tag) => {
        setSelectedTag(tag);
        setIsEditing(true);
    };

    const handleDelete = async (tagId) => {
        try {
            await deleteAdminTag(tagId, token);
            setTags((prevTags) => prevTags.filter((tag) => tag.tag_id !== tagId));
        } catch (error) {
            console.error('Error deleting tag:', error);
        }
    };

    const handleUpdate = async (updatedTag) => {
        try {
            await updateAdminTag(updatedTag.tag_id, updatedTag, token);
            const updatedTags = await fetchAdminTags(token);
            setTags(updatedTags);
            setIsEditing(false);
            setSelectedTag(null);
        } catch (error) {
            console.error('Error updating tag:', error);
        }
    };

    const handleAddTag = () => {
        setIsAdding(true);
    };

    const handleCreateTag = async () => {
        try {
            const tagData = {
                name: newTag.name,
            };

            await createAdminTag(tagData, token);
            const updatedTags = await fetchAdminTags(token);
            setTags(updatedTags);

            setIsAdding(false);
            setNewTag({ name: '' });
        } catch (error) {
            console.error('Error adding tag:', error);
        }
    };

    return (
        <div className="admin-tag-page">
            <h1>Управление тегами</h1>
            <input
                type="text"
                placeholder="Поиск тегов..."
                value={searchQuery}
                onChange={handleSearch}
            />

            <button onClick={handleAddTag}>Добавить тег</button>

            {isAdding && (
                <div className="add-tag-form">
                    <h2>Добавить новый тег</h2>
                    <input
                        type="text"
                        value={newTag.name}
                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        placeholder="Название тега"
                    />
                    <button onClick={handleCreateTag}>Добавить</button>
                    <button onClick={() => setIsAdding(false)}>Отмена</button>
                </div>
            )}

            <div className="tag-list">
                {filteredTags.map((tag) => (
                    <div key={tag.tag_id} className="tag-item">
                        <h3>{tag.name}</h3>

                        <button onClick={() => handleEdit(tag)}>Изменить</button>
                        <button onClick={() => handleDelete(tag.tag_id)}>Удалить</button>

                        {isEditing && selectedTag && selectedTag.tag_id === tag.tag_id && (
                            <div className="edit-form">
                                <h2>Изменить тег</h2>
                                <input
                                    type="text"
                                    value={selectedTag.name}
                                    onChange={(e) =>
                                        setSelectedTag({ ...selectedTag, name: e.target.value })
                                    }
                                    placeholder="Название"
                                />
                                <button onClick={() => handleUpdate(selectedTag)}>Сохранить</button>
                                <button onClick={() => setIsEditing(false)}>Отмена</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminTagPage;
