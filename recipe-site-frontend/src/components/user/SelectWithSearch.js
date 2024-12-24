import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import debounce from 'lodash.debounce';

const ProductSelectWithSearch = ({ placeholder, loadOptions, onChange, value }) => {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchable, setIsSearchable] = useState(true);
    const handleSearch = debounce(async (inputValue = '') => {
        if (typeof inputValue !== 'string') return;
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        setIsLoading(true);
        try {
            const results = await loadOptions(trimmedInput);
            setOptions(results.map((item) => ({ value: item.id, label: item.name })));
        } catch (err) {
            console.error('Error loading options:', err);
        } finally {
            setIsLoading(false);
        }
    }, 300);

    const handleProductChange = (selectedOption) => {
        if (!selectedOption) {
            onChange([]);
            return;
        }
        onChange(selectedOption);
    };


    return (
        <Select
            placeholder={placeholder}
            isLoading={isLoading}
            options={options}
            value={value} // Ensure value is passed here
            onInputChange={(value, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                    handleSearch(value);
                }
            }}
            onChange={handleProductChange}
            noOptionsMessage={() => 'No options found'}
            backspaceRemovesValue={false}
            blurInputOnSelect={false}
            isSearchable={isSearchable}
        />
    );
};

export default ProductSelectWithSearch;
