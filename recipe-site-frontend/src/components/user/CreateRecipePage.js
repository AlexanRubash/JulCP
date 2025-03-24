import React, { useState } from 'react';
import { uploadImage, createRecipe } from '../../api';
import SelectWithSearch from './SelectWithSearch';
import TagSelectWithSearch from './TagSelectWithSearch'; // Новый компонент
import { fetchProducts, fetchTags } from '../../api';
import '../css/CreateRecipePage.css'
import {useNavigate} from "react-router-dom";

const CreateRecipePage = ({ token }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [products, setProducts] = useState([]);
    const [tags, setTags] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [steps, setSteps] = useState([{ description: '', imageFile: null }]);
    const [error, setError] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState(null); // URL текущего изображения
    const [success, setSuccess] = useState('');
    const unitAbbreviationToId = {
        oz: 1, cup: 4, tsp: 5, lb: 15, tbsp: 47, g: 145, l: 588, can: 1267, ml: 1906, kg: 4613, pcs: 2
    };

    const unitOptions = Object.entries(unitAbbreviationToId).map(([abbr, id]) => ({
        value: id,
        label: abbr
    }));
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setCurrentImageUrl(previewUrl); // Показываем превью нового изображения
        }
    };
    const handleAddStep = () => {
        setSteps([...steps, { description: '', imageFile: null }]);
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...products];
        updatedProducts[index][field] = value;

        // Если поле unit_id = null, устанавливаем значение по умолчанию (граммы)
        if (field === "unit_id" && value === null) {
            updatedProducts[index].unit_id = 145;
        }

        setProducts(updatedProducts);
    };


    const handleSelectProduct = (selectedOption, index) => {
        const updatedProducts = [...products];
        updatedProducts[index].product_id = selectedOption.value;
        updatedProducts[index].name = selectedOption.label;
        setProducts(updatedProducts);
    };

    const handleAddProduct = () => {
        setProducts([...products, { product_id: '', name: '', quantity: '', unit_id: 145 }]);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            let imageUrl = '';
            const tempRecipeId = Date.now();
            if (imageFile) {
                imageUrl = await uploadImage(imageFile, 'recipeImage', token, tempRecipeId);
            }

            const stepImages = await Promise.all(
                steps.map(async (step, index) => {
                    if (step.imageFile) {
                        return await uploadImage(
                            step.imageFile,
                            'stepsImage',
                            token,
                            tempRecipeId,
                            index + 1
                        );
                    }
                    return '';
                })
            );

            const recipeData = {
                name,
                description,
                cooking_time: Number(cookingTime),
                products: products.map((p) => ({
                    product_id: Number(p.product_id),
                    quantity: p.quantity,
                    unit_id: p.unit_id || 145, // Если unit_id нет, ставим 145 (граммы)
                    product_name: p.name,
                })),
                tags: tags.map((t) => t.value),
                image_url: imageUrl,
                steps: steps.map((step, index) => ({
                    description: step.description,
                    image_data: stepImages[index] || '',
                })),
            };


            const newRecipe = await createRecipe(recipeData, token);

            if (newRecipe.recipeId) {
                await uploadImage(imageFile, 'recipeImage', token, newRecipe.id);
                await Promise.all(
                    steps.map(async (step, index) => {
                        if (step.imageFile) {
                            await uploadImage(
                                step.imageFile,
                                'stepsImage',
                                token,
                                newRecipe.id,
                                index + 1
                            );
                        }
                    })
                );

            }

            setSuccess('Recipe created successfully!');
            navigate(`/recipe/${newRecipe.recipeId}`);
        } catch (err) {
            setError('Failed to create recipe. Please try again.');
        }
    };

    return (
        <div className="create-recipe-container">
            <h2>Create Recipe</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Recipe Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Cooking Time (minutes)"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(e.target.value)}
                    required
                />
                <div>
                    <h3>Products</h3>
                    {products.map((product, index) => (
                        <div key={index} className="product-item">
                            <SelectWithSearch
                                placeholder="Search for a product"
                                loadOptions={(input) => fetchProducts(input, token)}
                                onChange={(selectedOption) => handleSelectProduct(selectedOption, index)}
                            />
                            <input
                                type="text"
                                placeholder="Quantity"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                required
                            />
                            <select
                                value={product.unit_id || 145} // По умолчанию ставим граммы (145)
                                onChange={(e) => handleProductChange(index, "unit_id", Number(e.target.value))}
                            >
                                {unitOptions.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setProducts(products.filter((_, productIndex) => productIndex !== index))}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddProduct}>
                        Add Product
                    </button>
                </div>
                <div>
                    <h3>Tags</h3>
                    <TagSelectWithSearch
                        placeholder="Search and select tags"
                        loadOptions={(input) => fetchTags(input, token)}
                        onChange={(selectedTags) => setTags(selectedTags)}
                    />
                </div>
                <div>
                    <h3>Steps</h3>
                    {steps.map((step, index) => (
                        <div key={index} className="step-container">
            <textarea
                placeholder="Step Description"
                value={step.description}
                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                required
            />
                            {step.imageUrl || step.imageFile ? (
                                <div
                                    className="image-preview-container"
                                    style={{position: 'relative', marginTop: '10px'}}
                                >
                                    <img
                                        src={
                                            step.imageFile
                                                ? URL.createObjectURL(step.imageFile)
                                                : step.imageUrl
                                        }
                                        alt={`Step ${index + 1}`}
                                        style={{
                                            width: '300px',
                                            height: 'auto',
                                            objectFit: 'cover',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            document.getElementById(`step-file-input-${index}`).click()
                                        }
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '5px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <input
                                    id={`step-file-input-${index}`}
                                    type="file"
                                    onChange={(e) =>
                                        handleStepChange(index, 'imageFile', e.target.files[0])
                                    }
                                    style={{display: 'block', marginTop: '10px'}}
                                />
                            )}
                            <input
                                id={`step-file-input-${index}`}
                                type="file"
                                style={{display: 'none'}}
                                onChange={(e) =>
                                    handleStepChange(index, 'imageFile', e.target.files[0])
                                }
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setSteps(steps.filter((_, stepIndex) => stepIndex !== index))
                                }
                                style={{
                                    marginTop: '10px',
                                    backgroundColor: 'red',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                Remove Step
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddStep}>
                        Add Step
                    </button>
                </div>
                <div>
                    <h3>Recipe Image</h3>
                    <input type="file" onChange={handleImageChange}/>
                </div>
                <button type="submit">Create Recipe</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default CreateRecipePage;
