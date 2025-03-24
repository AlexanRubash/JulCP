const userConsumedItemsRepository = require('./user_consumed_products.repository');
const productsRepository = require('../product/product.repository');
const recipesRepository = require('../recipe/recipe.repository');

const addConsumedItem = async (userId, itemData) => {
    let itemInfo;
    let isProduct = Boolean(itemData.product_id);

    if (isProduct) {
        itemInfo = await productsRepository.getProductById(itemData.product_id);
        if (!itemInfo) throw new Error('Продукт не найден');
    } else {
        itemInfo = await recipesRepository.getRecipeById(itemData.recipe_id);
        if (!itemInfo) throw new Error('Рецепт не найден');
    }

    const unitConversion = isProduct
        ? await userConsumedItemsRepository.getUnitConversionToGrams(itemData.unit_id)
        : null;

    const quantityInGrams = unitConversion ? itemData.quantity * unitConversion : itemData.quantity;

    const proteins = (itemInfo.proteins * quantityInGrams) / 100;
    const fats = (itemInfo.fats * quantityInGrams) / 100;
    const carbohydrates = (itemInfo.carbohydrates * quantityInGrams) / 100;
    const calories = (proteins * 4 + fats * 9 + carbohydrates * 4);

    const addedItem = await userConsumedItemsRepository.addConsumedItem(userId, {
        product_id: itemData.product_id || null,
        recipe_id: itemData.recipe_id || null,
        quantity: itemData.quantity,
        unit_id: itemData.unit_id || null,
        calories: Math.round(calories),
        proteins: Math.round(proteins * 100) / 100,
        fats: Math.round(fats * 100) / 100,
        carbohydrates: Math.round(carbohydrates * 100) / 100
    });

    return {
        ...addedItem,
        name: itemInfo.name
    };
};

const getConsumedItemsByDate = async (userId, date) => {
    const addedItems = await userConsumedItemsRepository.getConsumedItemsByDate(userId, date);

    return addedItems.map(item => ({
        ...item,
        name: item.product_name !== null ? item.product_name : item.recipe_name,
        unit_id: item.unit_id !== null ? item.unit_id : 145
    }));

};

const deleteConsumedItem = async (userId, consumptionId) => {
    return await userConsumedItemsRepository.deleteConsumedItem(userId, consumptionId);
};

module.exports = {
    addConsumedItem,
    getConsumedItemsByDate,
    deleteConsumedItem
};
