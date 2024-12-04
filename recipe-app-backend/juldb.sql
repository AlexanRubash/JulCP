-- Создание перечисления user_role
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Создание таблицы users
CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY,
                       username VARCHAR(50) UNIQUE NOT NULL,
                       password_hash TEXT NOT NULL,
                       role user_role NOT NULL DEFAULT 'user'
);

-- Создание таблицы categories
CREATE TABLE categories (
                            category_id SERIAL PRIMARY KEY,
                            name VARCHAR(50) UNIQUE NOT NULL
);

-- Создание таблицы products с учетом глобальности и создателя
CREATE TABLE products (
                          product_id SERIAL PRIMARY KEY,
                          name VARCHAR(255) UNIQUE NOT NULL,
                          category_id INTEGER,
                          description TEXT,
                          is_global BOOLEAN DEFAULT TRUE, -- По умолчанию продукт глобальный
                          created_by INTEGER, -- Идентификатор создателя
                          FOREIGN KEY (category_id) REFERENCES categories(category_id),
                          FOREIGN KEY (created_by) REFERENCES users(user_id),
                          CHECK (is_global = TRUE OR created_by IS NOT NULL) -- Проверка, что у личного продукта есть создатель
);

-- Создание таблицы recipes с учетом глобальности и создателя
CREATE TABLE recipes (
                         recipe_id SERIAL PRIMARY KEY,
                         name VARCHAR(100) NOT NULL,
                         description TEXT,
                         cooking_time INTEGER,
                         created_by INTEGER, -- Идентификатор создателя (может быть NULL для глобальных рецептов)
                         is_global BOOLEAN DEFAULT TRUE, -- По умолчанию рецепт глобальный
                         steps TEXT[], -- Шаги приготовления
                         FOREIGN KEY (created_by) REFERENCES users(user_id),
                         CHECK (is_global = TRUE OR created_by IS NOT NULL) -- Проверка, что у личного рецепта есть создатель
);

-- Создание таблицы recipe_products
CREATE TABLE recipe_products (
                                 recipe_id INTEGER NOT NULL,
                                 product_id INTEGER NOT NULL,
                                 quantity VARCHAR(255),
                                 PRIMARY KEY (recipe_id, product_id),
                                 FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
                                 FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Создание таблицы favorites
CREATE TABLE favorites (
                           user_id INTEGER NOT NULL,
                           recipe_id INTEGER NOT NULL,
                           PRIMARY KEY (user_id, recipe_id),
                           FOREIGN KEY (user_id) REFERENCES users(user_id),
                           FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

-- Таблица для хранения изображений шагов рецепта
CREATE TABLE step_images (
                             image_id SERIAL PRIMARY KEY,       -- Уникальный идентификатор изображения
                             recipe_id INTEGER NOT NULL,        -- Идентификатор рецепта
                             step_number INTEGER NOT NULL,      -- Номер шага
                             image_data BYTEA NOT NULL,         -- Данные изображения (BLOB)
                             FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Таблица для хранения изображений рецепта
CREATE TABLE recipe_images (
                               image_id SERIAL PRIMARY KEY,
                               recipe_id INTEGER NOT NULL,
                               image_url TEXT NOT NULL, -- Ссылка на изображение
                               FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id)
);

-- Таблица тегов
CREATE TABLE tags (
                      tag_id SERIAL PRIMARY KEY,
                      name VARCHAR(100) UNIQUE NOT NULL -- Уникальное имя тега
);

-- Таблица связи рецептов и тегов
CREATE TABLE recipe_tags (
                             recipe_id INTEGER NOT NULL,
                             tag_id INTEGER NOT NULL,
                             PRIMARY KEY (recipe_id, tag_id),
                             FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
                             FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);
DELETE  FROM recipes WHERE recipe_id = 5003