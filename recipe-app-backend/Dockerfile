# Используем официальный образ Node.js
FROM node:16

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY recipe-app-backend/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код в контейнер
COPY recipe-app-backend .

# Открываем порт 3000
EXPOSE 3000

# Запускаем сервер
CMD ["node", "src/app.js"]
