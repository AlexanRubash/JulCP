import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Оставляем только BrowserRouter здесь
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter> {/* Оборачиваем только здесь */}
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
