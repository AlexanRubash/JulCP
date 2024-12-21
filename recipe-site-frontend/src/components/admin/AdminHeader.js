// src/components/AdminHeader.js
import React from 'react';
import '../css/Header.css';

const AdminHeader = ({ onNavigate, onLogout }) => {
    return (
        <header className="header admin-header">
            <h1>Admin Panel</h1>
            <nav className="main-nav">
                <button className="nav-item" onClick={() => onNavigate('admin/users')}>
                    Users
                </button>
                <button className="nav-item" onClick={() => onNavigate('admin/recipes')}>
                    Recipes
                </button>
                <button className="nav-item" onClick={() => onNavigate('admin/products')}>
                    Products
                </button>
                <button className="nav-item" onClick={() => onNavigate('admin/tags')}>
                    Tags
                </button>
                <button className="nav-item" onClick={() => onNavigate('admin/categorys')}>
                    Categorys
                </button>
            </nav>
            <button className="logout-button" onClick={onLogout}>
                Log out
            </button>
        </header>
    );
};

export default AdminHeader;
