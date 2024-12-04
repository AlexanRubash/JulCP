// src/components/Header.js
import React from 'react';
import './css/Header.css'; // В Header.js
import Cookies from 'js-cookie';

const Header = ({ onLogout }) => {
    return (
        <header className="header">
            <h1>Recipe Site</h1>
            <button onClick={onLogout}>Log out</button>
        </header>
    );
};

export default Header;
