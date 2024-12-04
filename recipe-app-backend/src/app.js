const express = require('express');
const routes = require('./routes');  // Импортируем маршруты

const app = express();
const cors = require('cors');
app.use(cors());

// Middleware для обработки JSON
app.use(express.json());

// Подключаем маршруты
app.use('/api', routes);  // Все маршруты теперь будут начинаться с '/api'

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
