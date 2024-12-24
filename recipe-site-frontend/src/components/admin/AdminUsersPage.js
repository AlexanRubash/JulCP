import React, { useState, useEffect } from 'react';
import { fetchAllUsers, createUser, updateUser, deleteUser } from '../../api/adminApi';
import {useNavigate} from "react-router-dom";

const AdminUsersPage = ({ token, onNavigate }) => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'user',
    });
    const [message, setMessage] = useState(''); // Состояние для сообщений
    const navigate = useNavigate();

    // Загрузка списка пользователей
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await fetchAllUsers(token);
                setUsers(data);
            } catch (error) {
                console.error('Error loading users:', error);
            }
        };

        loadUsers();
    }, [token]);

    // Обработчик поиска
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Обработчик перехода на страницу пользователя
    const handleUserClick = (userId) => {
        navigate(`/admin/user/${userId}`);
    };

    // Обработчик создания нового пользователя
    const handleAddUser = () => {
        setIsAdding(true);
    };

    const handleCreateUser = async () => {
        try {
            const response = await createUser(newUser, token);
            if (response === "User registered") {
                setMessage("Пользователь успешно зарегистрирован!");
            }
            const updatedUsers = await fetchAllUsers(token);
            setUsers(updatedUsers);
            setIsAdding(false);
            setNewUser({ username: '', password: '', role: 'user' });
        } catch (error) {
            console.error('Error creating user:', error);
            setMessage("Ошибка при регистрации пользователя!");
        }
    };

    // Обработчик редактирования пользователя
    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
    };

    // Обновление пользователя
    const handleUpdateUser = async () => {
        try {
            const response = await updateUser(selectedUser.user_id, selectedUser, token);
            if (response === "User updated") {
                setMessage("Пользователь успешно обновлен!");
            }
            const updatedUsers = await fetchAllUsers(token);
            setUsers(updatedUsers);
            setIsEditing(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
            setMessage("Ошибка при обновлении пользователя!");
        }
    };

    // Удаление пользователя
    const handleDeleteUser = async (userId) => {
        try {
            const response = await deleteUser(userId, token);
            if (response === "User deleted") {
                setMessage("Пользователь успешно удален!");
            }
            setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessage("Ошибка при удалении пользователя!");
        }
    };

    return (
        <div className="admin-users-page">
            <h1>Управление пользователями</h1>
            <input
                type="text"
                placeholder="Поиск по имени..."
                value={searchQuery}
                onChange={handleSearch}
            />
            <button onClick={handleAddUser}>Добавить пользователя</button>

            {/* Сообщение */}
            {message && <div className="message">{message}</div>}

            {/* Форма добавления пользователя */}
            {isAdding && (
                <div className="add-user-form">
                    <h2>Добавить нового пользователя</h2>
                    <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="Имя пользователя"
                    />
                    <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Пароль"
                    />
                    <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                        <option value="user">Пользователь</option>
                        <option value="admin">Администратор</option>
                    </select>
                    <button onClick={handleCreateUser}>Создать</button>
                    <button onClick={() => setIsAdding(false)}>Отмена</button>
                </div>
            )}

            {/* Список пользователей */}
            <div className="user-list">
                {filteredUsers.map((user) => (
                    <div key={user.user_id} className="user-item">
                        <h3
                            onClick={() => handleUserClick(user.user_id)}
                            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                        >
                            {user.username}
                        </h3>
                        <p>ID: {user.user_id}</p>
                        <button onClick={() => handleEdit(user)}>Изменить</button>
                        <button onClick={() => handleDeleteUser(user.user_id)}>Удалить</button>

                        {/* Форма редактирования пользователя */}
                        {isEditing && selectedUser && selectedUser.user_id === user.user_id && (
                            <div className="edit-user-form">
                                <h2>Изменить пользователя</h2>
                                <input
                                    type="text"
                                    value={selectedUser.username}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, username: e.target.value })
                                    }
                                    placeholder="Имя пользователя"
                                />
                                <input
                                    type="password"
                                    value={selectedUser.password}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, password: e.target.value })
                                    }
                                    placeholder="Пароль"
                                />
                                <select
                                    value={selectedUser.role}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, role: e.target.value })
                                    }
                                >
                                    <option value="user">Пользователь</option>
                                    <option value="admin">Администратор</option>
                                </select>
                                <button onClick={handleUpdateUser}>Сохранить</button>
                                <button onClick={() => setIsEditing(false)}>Отмена</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsersPage;
