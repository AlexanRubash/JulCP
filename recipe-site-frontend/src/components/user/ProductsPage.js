import React, { useState, useEffect, useMemo } from 'react';
import { fetchProducts, fetchCategories } from '../../api/product';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate для программной навигации

const ProductsPage = ({ token }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [showCategories, setShowCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const itemsPerPage = 50; // Количество продуктов на странице

    useEffect(() => {
        // Загрузка всех продуктов
        const loadProducts = async () => {
            try {
                const data = await fetchProducts(token);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        // Загрузка всех категорий
        const loadCategories = async () => {
            try {
                const data = await fetchCategories(token);
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        loadProducts();
        loadCategories();
    }, [token]);

    const handleToggleCategory = (categoryId) => {
        setExpandedCategory((prevCategory) =>
            prevCategory === categoryId ? null : categoryId
        );
    };

    const handleShowCategories = () => {
        setShowCategories((prevShow) => !prevShow);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Сбрасываем текущую страницу при новом поиске
    };

    // Фильтрация продуктов по запросу
    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Фильтрация категорий: показывать только те, где есть продукты, соответствующие поисковому запросу
    const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
            const categoryProducts = filteredProducts.filter(
                (product) => product.category_id === category.category_id
            );
            return categoryProducts.length > 0;
        });
    }, [categories, filteredProducts]);

    // Функция для перехода на страницу продукта
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`); // Перенаправляем на страницу продукта
    };

    return (
        <div className="user-product-page">
            <h1>Продукты</h1>
            <input
                type="text"
                placeholder="Поиск продуктов..."
                value={searchQuery}
                onChange={handleSearch}
            />
            <button onClick={handleShowCategories}>
                {showCategories ? 'Show All Products' : 'Sorted by Categories'}
            </button>

            {!showCategories && (
                <div className="product-list">
                    {paginatedProducts.map((product) => (
                        <div key={product.product_id} className="product-item">
                            <div
                                className="product-name"
                                onClick={() => handleProductClick(product.product_id)}
                            >
                                <h3>{product.name}</h3>
                            </div>
                            <p>{product.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {showCategories && filteredCategories.length > 0 && (
                <div className="categories">
                    {filteredCategories.map((category) => (
                        <div key={category.category_id} className="category">
                            <h2
                                className="category-title"
                                onClick={() => handleToggleCategory(category.category_id)}
                            >
                                {category.name}
                            </h2>
                            {expandedCategory === category.category_id && (
                                <div className="category-products">
                                    {filteredProducts
                                        .filter((product) => product.category_id === category.category_id)
                                        .map((product) => (
                                            <div key={product.product_id} className="product-item">
                                                <div
                                                    className="product-name"
                                                    onClick={() => handleProductClick(product.product_id)}
                                                >
                                                    <h3>{product.name}</h3>
                                                </div>
                                                <p>{product.description}</p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="pagination-controls">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Назад
                </button>
                <span>
                    Страница {currentPage} из {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Вперед
                </button>
            </div>
        </div>
    );
};

export default ProductsPage;
