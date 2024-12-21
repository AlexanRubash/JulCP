import React, { useState } from 'react';
import { uploadImage, createRecipe } from '../../api';
import SelectWithSearch from './SelectWithSearch';
import TagSelectWithSearch from './TagSelectWithSearch'; // Новый компонент
import { fetchProducts, fetchTags } from '../../api';
import '../css/CreateRecipePage.css'

const CreateRecipePage = ({ token }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [products, setProducts] = useState([]);
    const [tags, setTags] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [steps, setSteps] = useState([{ description: '', imageFile: null }]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleImageChange = (e) => setImageFile(e.target.files[0]);

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
        setProducts(updatedProducts);
    };

    const handleSelectProduct = (selectedOption, index) => {
        const updatedProducts = [...products];
        updatedProducts[index].product_id = selectedOption.value;
        updatedProducts[index].name = selectedOption.label;
        setProducts(updatedProducts);
    };

    const handleAddProduct = () => {
        setProducts([...products, { product_id: '', name: '', quantity: '' }]);
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
                    product_name: p.name,
                })),
                tags: tags.map(Number),
                image_url: imageUrl,
                steps: steps.map((step, index) => ({
                    description: step.description,
                    image_data: stepImages[index] || '',
                })),
            };

            const newRecipe = await createRecipe(recipeData, token);

            if (newRecipe.id) {
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
                                type="number"
                                placeholder="Quantity"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setProducts(products.filter((_, productIndex) => productIndex !== index))
                                }
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
                        loadOptions={(input) => fetchTags(input, token)} // Функция для загрузки тегов
                        onChange={(selectedTags) => setTags(selectedTags)}
                    />
                </div>
                <div>
                    <h3>Steps</h3>
                    {steps.map((step, index) => (
                        <div key={index}>
                            <textarea
                                placeholder="Step Description"
                                value={step.description}
                                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                                required
                            />
                            <input
                                type="file"
                                onChange={(e) => handleStepChange(index, 'imageFile', e.target.files[0])}
                            />
                        </div>
                    ))}
                    <button type="button" onClick={handleAddStep}>Add Step</button>
                </div>
                <div>
                    <h3>Recipe Image</h3>
                    <input type="file" onChange={handleImageChange} />
                </div>
                <button type="submit">Create Recipe</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default CreateRecipePage;
