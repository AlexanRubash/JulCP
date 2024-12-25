# Используем официальный образ Node.js для React-приложений
FROM node:18

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY recipe-site-frontend/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект в контейнер
COPY recipe-site-frontend .

# Строим проект для продакшн
RUN npm run build

# Устанавливаем nginx для сервировки фронтенда
FROM nginx:alpine

# Копируем собранный фронтенд в директорию для nginx
COPY --from=0 /app/build /usr/share/nginx/html

# Открываем порт для nginx
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
