import React, { useState, useEffect } from "react";
import { fetchAllRecipes, getUserParameters } from "../../api";
import Iter from "es-iter";

const MealPlanForm = ({ token }) => {
    const [userParams, setUserParams] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [mealCombination, setMealCombination] = useState([]);

    useEffect(() => {
        fetchUserParams(); // Загружаем параметры пользователя
    }, []);

    const fetchUserParams = async () => {
        try {
            const params = await getUserParameters(token);
            const { age, height, weight, goal, activity_level } = params;
            const weightDecimal = parseFloat(weight);

            const baseCalories = (10 * weightDecimal + 6.25 * height - 5 * age + 5);
            const activityCoefficients = {
                'Минимальная активность': 1.2,
                'Слабая активность': 1.3,
                'Средняя': 1.5,
                'Интенсивная': 1.7
            };

            const tdee = baseCalories * activityCoefficients[activity_level];
            let targetCalories = tdee;
            if (goal === 'Похудеть') targetCalories = tdee * 0.85;
            else if (goal === 'Набрать вес') targetCalories = tdee * 1.15;

            const proteinGrams = weightDecimal * 1.6;
            const fatGrams = weightDecimal * 0.8;
            const remainingCalories = targetCalories - (proteinGrams * 4 + fatGrams * 9);
            const carbGrams = remainingCalories > 0 ? remainingCalories / 4 : 0;

            setUserParams({
                calories: targetCalories.toFixed(2),
                protein: proteinGrams.toFixed(2),
                fat: fatGrams.toFixed(2),
                carbohydrates: carbGrams.toFixed(2),
            });

        } catch (error) {
            console.error("Ошибка загрузки данных пользователя:", error);
        }
    };

    const fetchRecipes = async () => {
        if (!userParams) {
            console.log("Параметры пользователя не загружены.");
            return;
        }

        try {
            const { calories, protein, fat } = userParams;
            const allRecipes = await fetchAllRecipes(token, calories, protein, fat);

            // Преобразуем все значения в числа для избежания ошибок с типами данных
            const formattedRecipes = allRecipes.map(recipe => ({
                ...recipe,
                calories: parseFloat(recipe.calories) || 0,
                proteins: parseFloat(recipe.proteins) || 0,
                fats: parseFloat(recipe.fats) || 0,
                carbohydrates: parseFloat(recipe.carbohydrates) || 0,
            }));

            setRecipes(formattedRecipes);
        } catch (error) {
            console.error("Ошибка загрузки рецептов:", error);
        }
    };

    useEffect(() => {
        if (userParams) {
            fetchRecipes(); // Загружаем рецепты после того, как пользовательские параметры загружены
        }
    }, [userParams]);

    const findMealCombinationsOptimized = (recipes, targetCalories, targetProtein, targetFat) => {
        const tolerance = 100;
        const proteinTolerance = 10;
        const fatTolerance = 10;

        // Генерация всех возможных комбинаций рецептов (по 3 рецепта)
        const allCombinations = new Iter(recipes).combinations(3);

        // Проверка каждой комбинации на соответствие
        for (let combo of allCombinations) {
            const totalCalories = combo.reduce((acc, recipe) => acc + recipe.calories, 0);
            const totalProtein = combo.reduce((acc, recipe) => acc + recipe.proteins, 0);
            const totalFat = combo.reduce((acc, recipe) => acc + recipe.fats, 0);

            if (
                Math.abs(targetCalories - totalCalories) <= tolerance &&
                Math.abs(targetProtein - totalProtein) <= proteinTolerance &&
                Math.abs(targetFat - totalFat) <= fatTolerance
            ) {
                return [combo];  // Возвращаем сразу первую подходящую комбинацию
            }
        }

        // Если не найдено подходящей комбинации
        return [];
    };

    const calculateMealPlan = () => {
        if (!userParams || recipes.length === 0) return;

        const { calories, protein, fat } = userParams;

        const mealCombinations = findMealCombinationsOptimized(recipes, calories, protein, fat);
        if (mealCombinations.length > 0) {
            setMealCombination(mealCombinations[0]); // Выбираем первую подходящую комбинацию
        } else {
            console.log("Не удалось найти подходящую комбинацию.");
        }
    };

    useEffect(() => {
        calculateMealPlan();
    }, [recipes, userParams]);

    const replaceRecipeInCombination = (indexToReplace) => {
        let newMealCombination = [...mealCombination];
        const rejectedRecipe = newMealCombination[indexToReplace];
        let availableRecipes = recipes.filter(recipe => !newMealCombination.includes(recipe));

        // Пробуем заменить только один рецепт
        for (let newRecipe of availableRecipes) {
            newMealCombination[indexToReplace] = newRecipe;  // Заменяем выбранный рецепт

            // Проверяем, подходит ли новая комбинация
            const totalCalories = newMealCombination.reduce((acc, recipe) => acc + recipe.calories, 0);
            const totalProtein = newMealCombination.reduce((acc, recipe) => acc + recipe.proteins, 0);
            const totalFat = newMealCombination.reduce((acc, recipe) => acc + recipe.fats, 0);

            // Если новая комбинация соответствует целям по БЖУ и калориям
            if (
                Math.abs(userParams.calories - totalCalories) <= 100 &&
                Math.abs(userParams.protein - totalProtein) <= 10 &&
                Math.abs(userParams.fat - totalFat) <= 10
            ) {
                setMealCombination(newMealCombination);  // Обновляем состояние с новой комбинацией
                return;
            }
        }

        alert("Не удалось найти замену, попробуйте выбрать другой рецепт для замены.");
    };

    const handleRejectRecipe = (indexToReject) => {
        replaceRecipeInCombination(indexToReject);
    };

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Генерация рациона</h3>
            {userParams && (
                <>
                    <h4 className="mt-4 text-lg font-semibold">Ваши параметры:</h4>
                    <p>Калории: {userParams.calories} ккал</p>
                    <p>Белки: {userParams.protein} г</p>
                    <p>Жиры: {userParams.fat} г</p>
                    <p>Углеводы: {userParams.carbohydrates} г</p>

                    <h4 className="mt-4 text-lg font-semibold">Подходящие рецепты:</h4>
                    {mealCombination.length > 0 ? (
                        <>
                            <ul className="list-disc pl-5">
                                {mealCombination.map((recipe, index) => (
                                    <li key={recipe.recipe_id}>
                                        {recipe.name} - {recipe.calories} ккал |
                                        {recipe.proteins} г белка |
                                        {recipe.fats} г жира |
                                        {recipe.carbohydrates} г углеводов
                                        <button
                                            onClick={() => handleRejectRecipe(index)}
                                            className="ml-2 text-red-500"
                                        >
                                            Отказаться
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            {/* Вывод суммы БЖУ и калорий */}
                            <div className="mt-4 font-semibold">
                                <p>Сумма:</p>
                                <p>
                                    Калории:{" "}
                                    {mealCombination.reduce((acc, recipe) => acc + recipe.calories, 0)} ккал
                                </p>
                                <p>
                                    Белки:{" "}
                                    {mealCombination.reduce((acc, recipe) => acc + recipe.proteins, 0)} г
                                </p>
                                <p>
                                    Жиры:{" "}
                                    {mealCombination.reduce((acc, recipe) => acc + recipe.fats, 0)} г
                                </p>
                                <p>
                                    Углеводы:{" "}
                                    {mealCombination.reduce((acc, recipe) => acc + recipe.carbohydrates, 0)} г
                                </p>
                            </div>
                        </>
                    ) : (
                        <p>Не найдено подходящих комбинаций рецептов.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default MealPlanForm;
