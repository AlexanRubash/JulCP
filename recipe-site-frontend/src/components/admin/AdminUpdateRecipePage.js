import React, { useState, useEffect } from 'react';
import { uploadImage, fetchRecipeById } from '../../api';
import { adminUpdateRecipe } from '../../api/adminApi';
import ProductSelectWithSearch from './ProductSelectWithSearch';
import TagSelectWithSearch from './TagSelectWithSearch';
import { fetchProducts, fetchTags } from '../../api';
import {useNavigate, useParams} from 'react-router-dom';

//разобраться с отображением тегов
const AdminUpdateRecipePage = ({ token }) => {
    const { recipeId } = useParams();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [products, setProducts] = useState([]);
    const [tags, setTags] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [steps, setSteps] = useState([{ description: '', imageFile: null }]); // Гарантия правильного формата
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState(null); // URL текущего изображения
    const [options, setOptions] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await fetchRecipeById(recipeId, token);
                console.log('Fetched Recipe Data:', data);

                setName(data.name);
                setDescription(data.description);
                setCookingTime(data.cooking_time);
                setProducts(data.products || []);
                console.log('Products:', products);

                // Если теги приходят в формате [{ tag_id: 1, name: 'Tag1' }, { tag_id: 2, name: 'Tag2' }]
                setTags((data.tags || []).map(tag => ({ value: tag.tag_id, label: tag.name })));
                console.log('Tags:', tags);

                // Связь шагов с изображениями
                const stepsWithImages = (data.steps || []).map((step, index) => {
                    const stepImage = data.stepImages?.find(
                        (img) => img.step_number === index + 1
                    );
                    return {
                        description: step || '', // Обеспечиваем, что даже null будет заменён на пустую строку
                        imageFile: null,
                        imageUrl: stepImage?.image_data || null, // URL изображения, если оно есть
                    };
                });

                setSteps(stepsWithImages);

                setCurrentImageUrl(data.image.image_url || null);
            } catch (err) {
                console.error('Error fetching recipe:', err); // Логируем ошибку в консоль
                const errorMessage = `Failed to fetch recipe details: ${err.message || 'Unknown error'}`;
                setError(errorMessage); // Устанавливаем подробное сообщение об ошибке
            }
        };

        fetchRecipe();
    }, [recipeId, token]);



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setCurrentImageUrl(previewUrl); // Показываем превью нового изображения
        }
    };

    const handleAddStep = () => {
        setSteps([...steps, { description: '', imageFile: null }]); // Добавляем новый шаг в нужном формате
    };

    const handleStepChange = (index, field, value) => {
        setSteps(prevSteps =>
            prevSteps.map((step, i) =>
                i === index
                    ? {
                        ...step,
                        [field]: value, // Обновляем только поле, которое изменилось
                    }
                    : step
            )
        );
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
            let imageUrl = currentImageUrl; // Начальное значение - текущее изображение
            if (imageFile) {
                try {
                    imageUrl = await uploadImage(imageFile, 'recipeImage', token, recipeId);
                    console.log('Uploaded main image URL:', imageUrl);
                } catch (imageUploadError) {
                    throw new Error(`Failed to upload main image: ${imageUploadError.message}`);
                }
            }

            // Загружаем изображения для каждого шага, если они есть
            let stepImages = [];
            try {
                stepImages = await Promise.all(
                    steps.map(async (step, index) => {
                        if (step.imageFile) {
                            try {
                                const uploadedImageUrl = await uploadImage(
                                    step.imageFile,
                                    'stepsImage',
                                    token,
                                    recipeId,
                                    index + 1
                                );
                                console.log(`Uploaded step ${index + 1} image URL:`, uploadedImageUrl);
                                return { step_number: index + 1, image_url: uploadedImageUrl };
                            } catch (stepImageUploadError) {
                                console.error(`Failed to upload image for step ${index + 1}:`, stepImageUploadError);
                                throw stepImageUploadError;
                            }
                        }
                        // Если файл изображения не изменился, возвращаем старую ссылку на изображение
                        if (step.imageUrl) {
                            return { step_number: index + 1, image_url: step.imageUrl };
                        }
                        return null;
                    })
                );
            } catch (allStepImagesError) {
                throw new Error(`Failed to upload step images: ${allStepImagesError.message}`);
            }


            // Отфильтровываем шаги без изображений
            const filteredStepImages = stepImages.filter(Boolean);

            const recipeData = {
                name,
                description,
                cooking_time: Number(cookingTime),
                products: products.map((p) => ({
                    product_id: Number(p.product_id),
                    quantity: p.quantity,
                    product_name: p.name,
                })),
                tags: tags.map((t) => t.value),
                image_url: imageUrl,
                steps: steps.map((step) => step.description), // Только строки для шагов
                step_images: filteredStepImages, // Передаем изображения шагов на сервер
            };

            await adminUpdateRecipe(recipeId, recipeData, token);

            setSuccess('Recipe updated successfully!');
            navigate(`/recipe/${recipeId}`);
        } catch (err) {
            console.error('Error updating recipe:', err); // Логируем полную ошибку
            const errorMessage = `Failed to update recipe. ${err.message || 'An unknown error occurred.'}`;
            setError(errorMessage); // Показываем подробное сообщение об ошибке
        }
    };

    const handleTagChange = (selectedOptions) => {
        // Если selectedOptions - это массив, как в случае с multi-select
        const updatedTags = selectedOptions || [];
        setTags(updatedTags);
    };


    return (
        <div className="update-recipe-container">
            <h2>Update Recipe</h2>
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
                            <ProductSelectWithSearch
                                placeholder="Search for a product"
                                loadOptions={(input) => fetchProducts(input, token)}
                                onChange={(selectedOption) => handleSelectProduct(selectedOption, index)}
                                value={{
                                    value: product.product_id,
                                    label: product.name
                                }} // Устанавливаем выбранное значение
                            />
                            <input
                                type="text"
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
                        loadOptions={(input) => fetchTags(input, token)} // Передаем правильную функцию загрузки
                        onChange={(selectedTags) => handleTagChange(selectedTags)} // Обновляем состояние выбранных тегов
                        value={tags} // Передаем уже отформатированные теги в виде [{ value, label }]
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
                    {currentImageUrl ? (
                        <div className="image-preview-container" style={{position: 'relative'}}>
                            <img
                                src={currentImageUrl}
                                alt="Recipe"
                                style={{width: '300px', height: 'auto', objectFit: 'cover'}}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('file-input').click()}
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
                            id="file-input"
                            type="file"
                            onChange={handleImageChange}
                            style={{display: currentImageUrl ? 'none' : 'block'}}
                        />
                    )}
                    <input
                        id="file-input"
                        type="file"
                        style={{display: 'none'}}
                        onChange={handleImageChange}
                    />
                </div>
                <button type="submit">Update Recipe</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default AdminUpdateRecipePage;
