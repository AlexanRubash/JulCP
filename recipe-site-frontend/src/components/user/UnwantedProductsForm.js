import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import debounce from 'lodash.debounce';
import { addUserUnwantedProduct, removeUserUnwantedProduct, fetchProducts, getUserUnwantedProducts } from '../../api';

const UnwantedProductsForm = ({ userId, token }) => {
    const [unwantedProducts, setUnwantedProducts] = useState([]); // Состояние для списка нежелательных продуктов
    const [ingredientOptions, setIngredientOptions] = useState([]); // Опции для поиска продуктов
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);
    const [noProductsFound, setNoProductsFound] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null); // Состояние для выбранного продукта

    // Функция загрузки списка нежелательных продуктов пользователя
    const loadUnwantedProducts = async () => {
        try {
            const products = await getUserUnwantedProducts(token); // Получаем данные с сервера
            setUnwantedProducts(products.map(product => ({
                id: product.product_id,
                name: product.name
            }))); // Преобразуем в формат, который мы используем в приложении
        } catch (error) {
            console.error('Ошибка при загрузке списка нежелательных продуктов:', error);
        }
    };

    // Загружаем нежелательные продукты при монтировании компонента
    useEffect(() => {
        loadUnwantedProducts(); // Вызываем функцию для загрузки данных
    }, [userId, token]); // Зависимости от userId и token

    // Функция поиска продуктов при вводе
    const fetchIngredientOptions = async (inputValue) => {
        if (!inputValue.trim()) {
            setIngredientOptions([]);
            setNoProductsFound(false);
            return;
        }

        setIsLoadingOptions(true);
        try {
            const products = await fetchProducts(inputValue, token); // Запрос продуктов по введенному значению
            if (products.length === 0) {
                setNoProductsFound(true);
            } else {
                setNoProductsFound(false);
            }
            setIngredientOptions(products.map((product) => ({
                value: product.product_id,
                label: product.name,
            })));
        } catch (error) {
            console.error('Ошибка при поиске продуктов:', error);
        } finally {
            setIsLoadingOptions(false);
        }
    };

    // Дебаунс для оптимизации поиска
    const handleIngredientsSearch = debounce(fetchIngredientOptions, 300);

    // Обработчик выбора продукта
    const handleSelectProduct = async (product) => {
        if (!product) return;

        // Добавляем выбранный продукт в список нежелательных продуктов
        try {
            await addUserUnwantedProduct(userId, product.value, token);

            // Обновляем список нежелательных продуктов в состоянии
            setUnwantedProducts([...unwantedProducts, { id: product.value, name: product.label }]);

            // Очищаем выбранный продукт, чтобы строка ввода пустовала
            setSelectedProduct(null);
        } catch (error) {
            console.error('Ошибка при добавлении продукта:', error);
        }
    };

    // Удаление продукта из списка нежелательных
    const handleRemoveProduct = async (productId) => {
        try {
            // Удаляем продукт с сервера
            await removeUserUnwantedProduct(userId, productId, token);
            // Обновляем состояние
            setUnwantedProducts(unwantedProducts.filter(product => product.id !== productId));
        } catch (error) {
            console.error('Ошибка при удалении продукта:', error);
        }
    };

    return (
        <div>
            <h3>Выберите нежелательные продукты</h3>
            <Select
                isMulti={false}  // Убираем множественный выбор
                placeholder="Введите название продукта..."
                options={ingredientOptions}
                value={selectedProduct}  // Устанавливаем выбранный продукт
                onChange={handleSelectProduct}  // Обработчик для выбора продукта
                onInputChange={handleIngredientsSearch}
                isLoading={isLoadingOptions}
                noOptionsMessage={() => {
                    if (isLoadingOptions) return 'Загрузка...';
                    return noProductsFound ? 'Продукты не найдены' : 'Начните вводить название';
                }}
                getOptionLabel={(e) => e.label}
                getOptionValue={(e) => e.value}
            />

            {/* Список выбранных нежелательных продуктов */}
            <h4>Ваши нежелательные продукты:</h4>
            <ul>
                {unwantedProducts.map(product => (
                    <li key={product.id}>
                        {product.name}
                        <button onClick={() => handleRemoveProduct(product.id)}>❌</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UnwantedProductsForm;
