import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import debounce from 'lodash.debounce';

const TagSelectWithSearch = ({ placeholder, loadOptions, onChange }) => {
    const [options, setOptions] = useState([]); // Список тегов
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки

    // Дебаунс обработчика ввода
    const handleSearch = debounce(async (inputValue) => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) {
            setOptions([]); // Очистка списка при пустом вводе
            return;
        }

        setIsLoading(true); // Включаем индикатор загрузки
        try {
            const results = await loadOptions(trimmedInput);
            console.log('API Response:', results);

            // Исправляем преобразование данных
            setOptions(results.map((item) => ({ value: item.tag_id, label: item.name })));
        } catch (err) {
            console.error('Error loading tags:', err);
        } finally {
            setIsLoading(false); // Выключаем индикатор загрузки
        }
    }, 300);


    // Слушатель выбора
    const handleTagChange = (selectedOptions) => {
        const selectedValues = selectedOptions?.map((option) => option.value) || [];
        onChange(selectedValues); // Передаем выбранные ID
    };

    return (
        <Select
            isMulti
            placeholder={placeholder}
            isLoading={isLoading}
            options={options} // Опции для выбора
            onInputChange={(value, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                    handleSearch(value); // Обрабатываем поиск
                }
            }}
            onChange={handleTagChange} // Обработка выбора
            noOptionsMessage={() => (isLoading ? 'Loading...' : 'No tags found')}
            backspaceRemovesValue={true}
            blurInputOnSelect={false}
            isSearchable={true}
        />
    );
};

export default TagSelectWithSearch;