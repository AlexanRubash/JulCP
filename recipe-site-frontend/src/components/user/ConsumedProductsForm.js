import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import debounce from 'lodash.debounce';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { fetchProducts, addConsumedProduct, getConsumedProductsByDate, deleteConsumedProduct, searchRecipesByName, addConsumedRecipe } from '../../api';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56'];

const unitAbbreviationToId = {
    oz: 1, cup: 4, tsp: 5, lb: 15, tbsp: 47, g: 145, l: 588, can: 1267, ml: 1906, kg: 4613, pcs: 2
};

const unitOptions = Object.entries(unitAbbreviationToId).map(([abbr, id]) => ({
    value: id,
    label: abbr
}));

const ConsumedItemsForm = ({ token }) => {
    const [consumedItems, setConsumedItems] = useState([]);
    const [ingredientOptions, setIngredientOptions] = useState([]);
    const [recipeOptions, setRecipeOptions] = useState([]);
    const [selectedType, setSelectedType] = useState('product');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [quantity, setQuantity] = useState('');
    const today = new Date();

    useEffect(() => {
        const loadConsumedItems = async () => {
            try {
                const formattedDate = today.toISOString().split('T')[0];
                const items = await getConsumedProductsByDate(formattedDate, token);

                // Добавляем unit_name на основе unit_id
                const updatedItems = items.map(item => ({
                    ...item,
                    unit_name: Object.keys(unitAbbreviationToId).find(
                        key => unitAbbreviationToId[key] === item.unit_id
                    ) || 'неизвестно' // Если unit_id не найден, ставим 'неизвестно'
                }));

                setConsumedItems(updatedItems);
            } catch (error) {
                console.error('Ошибка при загрузке:', error);
            }
        };
        loadConsumedItems();
    }, [token]);


    const fetchIngredientOptions = async (inputValue) => {
        if (!inputValue.trim()) return;
        try {
            const products = await fetchProducts(inputValue, token);
            setIngredientOptions(products.map((p) => ({ value: p.product_id, label: p.name })));
        } catch (error) {
            console.error('Ошибка при поиске продуктов:', error);
        }
    };

    const handleSearchRecipes = debounce(async (text) => {
        if (text.length > 2) {
            try {
                const recipes = await searchRecipesByName(text, token);
                setRecipeOptions(recipes.map((r) => ({ value: r.recipe_id, label: r.name })));
            } catch (error) {
                console.error('Ошибка поиска рецептов:', error);
                setRecipeOptions([]);
            }
        } else {
            setRecipeOptions([]);
        }
    }, 500);

    const handleAddItem = async () => {
        if (selectedType === 'product' && selectedProduct && quantity && selectedUnit) {
            const newItem = {
                product_id: selectedProduct.value,
                quantity: parseFloat(quantity),
                unit_id: selectedUnit.value,
                name: selectedProduct.label
            };
            await addConsumedProduct(newItem, token);
            setConsumedItems([...consumedItems, newItem]);
        } else if (selectedType === 'recipe' && selectedRecipe && quantity) {
            const newItem = {
                recipe_id: selectedRecipe.value,
                quantity: parseFloat(quantity),
                name: selectedRecipe.label
            };
            await addConsumedRecipe(newItem, token);
            setConsumedItems([...consumedItems, newItem]);
        } else {
            alert('Заполните все поля!');
        }
        setSelectedProduct(null);
        setSelectedRecipe(null);
        setQuantity('');
        setSelectedUnit(null);
    };

    const handleRemoveItem = async (id) => {
        try {
            await deleteConsumedProduct(id, token);
            setConsumedItems(consumedItems.filter((item) => item.consumption_id !== id));
        } catch (error) {
            console.error('Ошибка при удалении:', error);
        }
    };

    const totalMacros = consumedItems.reduce((acc, item) => {
        return {
            proteins: acc.proteins + (parseFloat(item.proteins) || 0),
            fats: acc.fats + (parseFloat(item.fats) || 0),
            carbohydrates: acc.carbohydrates + (parseFloat(item.carbohydrates) || 0)
        };
    }, { proteins: 0, fats: 0, carbohydrates: 0 });

// Округление до трех знаков
    totalMacros.proteins = parseFloat(totalMacros.proteins.toFixed(3));
    totalMacros.fats = parseFloat(totalMacros.fats.toFixed(3));
    totalMacros.carbohydrates = parseFloat(totalMacros.carbohydrates.toFixed(3));

    console.log(`БЖУ: Белки ${totalMacros.proteins}, Жиры ${totalMacros.fats}, Углеводы ${totalMacros.carbohydrates}`);

    const chartData = [
        { name: 'Белки', value: totalMacros.proteins },
        { name: 'Жиры', value: totalMacros.fats },
        { name: 'Углеводы', value: totalMacros.carbohydrates }
    ];


    return (
        <div>
            <h3>Добавить съеденное</h3>
            <div>
                <label>
                    <input type="radio" value="product" checked={selectedType === 'product'} onChange={() => setSelectedType('product')} /> Продукт
                </label>
                <label>
                    <input type="radio" value="recipe" checked={selectedType === 'recipe'} onChange={() => setSelectedType('recipe')} /> Рецепт
                </label>
            </div>
            {selectedType === 'product' ? (
                <Select
                    placeholder="Введите название продукта..."
                    options={ingredientOptions}
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    onInputChange={debounce(fetchIngredientOptions, 300)}
                />
            ) : (
                <Select
                    placeholder="Введите название рецепта..."
                    options={recipeOptions}
                    value={selectedRecipe}
                    onChange={setSelectedRecipe}
                    onInputChange={handleSearchRecipes}
                />
            )}
            {selectedType === 'product' && (
                <Select
                    placeholder="Выберите единицу измерения"
                    options={unitOptions}
                    value={selectedUnit}
                    onChange={setSelectedUnit}
                />
            )}
            <input type="number" placeholder="Количество" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <button onClick={handleAddItem}>Добавить</button>
            <h4>Съеденные продукты/рецепты:</h4>
            <ul>
                {consumedItems.map((item) => (
                    <li key={item.id}>{item.name} - {item.quantity} {item.unit_name || 'г'} ( {item.calories} Kcal)
                        <button onClick={() => handleRemoveItem(item.consumption_id)}>❌</button>
                    </li>
                ))}
            </ul>
            <h4>Баланс БЖУ:</h4>
            <PieChart width={300} height={300}>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                    {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default ConsumedItemsForm;
