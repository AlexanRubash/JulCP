import React, { useState } from 'react';
import Select from 'react-select';
import debounce from 'lodash.debounce';

const TagSelectWithSearch = ({ placeholder, loadOptions, onChange, value }) => {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = debounce(async (inputValue) => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) {
            setOptions([]);
            return;
        }

        setIsLoading(true);
        try {
            const results = await loadOptions(trimmedInput);
            setOptions(results.map(item => ({
                value: item.tag_id,
                label: item.name,
            })));
        } catch (err) {
            console.error('Error loading tags:', err);
        } finally {
            setIsLoading(false);
        }
    }, 300);

    return (
        <Select
            isMulti
            placeholder={placeholder}
            isLoading={isLoading}
            options={options}
            onInputChange={(value, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                    handleSearch(value);
                }
            }}
            onChange={onChange}
            noOptionsMessage={() => (isLoading ? 'Loading...' : 'No tags found')}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            value={value}
        />
    );
};

export default TagSelectWithSearch;
