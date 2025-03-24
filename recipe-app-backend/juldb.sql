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
ALTER TABLE products
    ADD COLUMN proteins DECIMAL(10, 2),  -- Белки (граммы на 100г продукта)
    ADD COLUMN fats DECIMAL(10, 2),      -- Жиры (граммы на 100г продукта)
    ADD COLUMN carbohydrates DECIMAL(10, 2),  -- Углеводы (граммы на 100г продукта)
    ADD COLUMN calories DECIMAL(10, 2);  -- Калории (ккал на 100г продукта)

-- Создание таблицы recipes с учетом глобальности и создателя
CREATE TABLE recipes (
                         recipe_id SERIAL PRIMARY KEY,
                         name VARCHAR(100) NOT NULL,
                         description TEXT,
                         cooking_time INTEGER,
                         created_by INTEGER, -- Идентификатор создателя (может быть NULL для глобальных рецептов)
                         is_global BOOLEAN DEFAULT TRUE, -- По умолчанию рецепт глобальный
                         steps TEXT[], -- Шаги приготовления
                         serving_size INTEGER,
                         FOREIGN KEY (created_by) REFERENCES users(user_id),
                         CHECK (is_global = TRUE OR created_by IS NOT NULL) -- Проверка, что у личного рецепта есть создатель
);

-- Создание таблицы recipe_products
CREATE TABLE recipe_products (
                                 recipe_id INTEGER NOT NULL,
                                 product_id INTEGER NOT NULL,
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
-- Создание перечисления для цели пользователя
CREATE TYPE user_goal AS ENUM ('Похудеть', 'Набрать вес', 'Сохранить вес');

-- Создание перечисления для уровня подвижности
CREATE TYPE activity_level AS ENUM ('низкий', 'средний', 'высокий');

-- Создание таблицы user_parameters
CREATE TABLE user_parameters (
                                 user_id INTEGER PRIMARY KEY, -- Связь с пользователем
                                 age INT, -- Возраст
                                 height INT, -- Рост (в см)
                                 weight DECIMAL(5, 2), -- Вес (в кг)
                                 goal user_goal, -- Цель пользователя
                                 activity_level activity_level, -- Уровень подвижности
                                 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Создание таблицы для хранения нежелательных продуктов пользователя
CREATE TABLE user_unwanted_products (
                                        user_id INTEGER NOT NULL,
                                        product_id INTEGER NOT NULL,
                                        PRIMARY KEY (user_id, product_id),
                                        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                                        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Создание таблицы diets (рационы)
CREATE TABLE diets (
                       diet_id SERIAL PRIMARY KEY, -- Уникальный идентификатор рациона
                       name VARCHAR(100) NOT NULL, -- Название рациона (например, "Рацион на 3 приема пищи")
                       meals_per_day INT NOT NULL CHECK (meals_per_day IN (3, 5)) -- Количество приемов пищи (3 или 5)
);

-- Создание таблицы diet_recipes (связь рациона с рецептами)
CREATE TABLE diet_recipes (
                              diet_id INTEGER NOT NULL, -- Идентификатор рациона
                              recipe_id INTEGER NOT NULL, -- Идентификатор рецепта (блюда)
                              meal_number INT NOT NULL, -- Номер приема пищи (1, 2, 3 и т.д.)
                              PRIMARY KEY (diet_id, recipe_id, meal_number),
                              FOREIGN KEY (diet_id) REFERENCES diets(diet_id) ON DELETE CASCADE,
                              FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- Создание таблицы user_diets (назначенные рационы пользователю)
CREATE TABLE user_diets (
                            user_diet_id SERIAL PRIMARY KEY, -- Уникальный идентификатор записи
                            user_id INTEGER NOT NULL, -- Идентификатор пользователя
                            diet_id INTEGER NOT NULL, -- Идентификатор рациона
                            date DATE NOT NULL, -- Дата, на которую назначен рацион
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                            FOREIGN KEY (diet_id) REFERENCES diets(diet_id) ON DELETE CASCADE,
                            UNIQUE (user_id, date) -- Один рацион на пользователя в день
);

-- Создание таблицы user_consumed_recipes (съеденные пользователем блюда)
CREATE TABLE user_consumed_recipes (
                                       user_id INTEGER NOT NULL, -- Идентификатор пользователя
                                       recipe_id INTEGER NOT NULL, -- Идентификатор рецепта (блюда)
                                       date DATE NOT NULL, -- Дата, когда блюдо было съедено
                                       PRIMARY KEY (user_id, recipe_id, date),
                                       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                                       FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);


CREATE TABLE units (
                       unit_id SERIAL PRIMARY KEY,
                       name VARCHAR(50) UNIQUE NOT NULL, -- Название, например, 'грамм', 'мл', 'штука'
                       abbreviation VARCHAR(20) NOT NULL, -- Короткое обозначение: 'g', 'ml', 'pcs'
                       conversion_to_grams DECIMAL(10, 4) NULL, -- Пересчет в граммы (если применимо)
                       conversion_to_milliliters DECIMAL(10, 4) NULL -- Пересчет в миллилитры (если применимо)
);
ALTER TABLE recipe_products
    ADD COLUMN quantity_value DECIMAL(10, 2), -- Числовое значение
    ADD COLUMN unit_id INTEGER, -- Ссылка на единицу измерения
    ADD FOREIGN KEY (unit_id) REFERENCES units(unit_id);

SELECT
    r.recipe_id,
    r.name AS recipe_name,
    SUM(p.proteins * (rp.quantity_value * COALESCE(u.conversion_to_grams, 1) / 100)) AS total_proteins,
    SUM(p.fats * (rp.quantity_value * COALESCE(u.conversion_to_grams, 1) / 100)) AS total_fats,
    SUM(p.carbohydrates * (rp.quantity_value * COALESCE(u.conversion_to_grams, 1) / 100)) AS total_carbohydrates,
    SUM(p.calories * (rp.quantity_value * COALESCE(u.conversion_to_grams, 1) / 100)) AS total_calories
FROM recipes r
         JOIN recipe_products rp ON r.recipe_id = rp.recipe_id
         JOIN products p ON rp.product_id = p.product_id
         LEFT JOIN units u ON rp.unit_id = u.unit_id
WHERE r.recipe_id = 1
GROUP BY r.recipe_id, r.name;

-- Обновляем запись для унции (ounce)
UPDATE units
SET conversion_to_grams = 28.3495, conversion_to_milliliters = NULL
WHERE abbreviation = 'oz';

-- Обновляем запись для чашки (cup)
UPDATE units
SET conversion_to_grams = 240, conversion_to_milliliters = 240
WHERE abbreviation = 'cup';

-- Обновляем запись для чайной ложки (teaspoon)
UPDATE units
SET conversion_to_grams = 4.92892, conversion_to_milliliters = 4.92892
WHERE abbreviation = 'tsp';

-- Обновляем запись для фунта (pound)
UPDATE units
SET conversion_to_grams = 453.592, conversion_to_milliliters = NULL
WHERE abbreviation = 'lb';

-- Обновляем запись для столовой ложки (tablespoon)
UPDATE units
SET conversion_to_grams = 14.7868, conversion_to_milliliters = 14.7868
WHERE abbreviation = 'tbsp';

-- Обновляем запись для грамма (gram)
UPDATE units
SET conversion_to_grams = 1, conversion_to_milliliters = 1
WHERE abbreviation = 'g';

-- Обновляем запись для литра (liter)
UPDATE units
SET conversion_to_grams = NULL, conversion_to_milliliters = 1000
WHERE abbreviation = 'l';

-- Обновляем запись для банки (can)
UPDATE units
SET conversion_to_grams = NULL, conversion_to_milliliters = 330
WHERE abbreviation = 'can';

-- Обновляем запись для миллилитра (milliliter)
UPDATE units
SET conversion_to_grams = NULL, conversion_to_milliliters = 1
WHERE abbreviation = 'ml';

-- Обновляем запись для килограмма (kilogram)
UPDATE units
SET conversion_to_grams = 1000, conversion_to_milliliters = NULL
WHERE abbreviation = 'kg';
