import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import SearchPage from './components/user/SearchPage';
import RecipePage from './components/user/RecipePage';
import Header from './components/user/Header'; // Обычный хедер
import AdminHeader from './components/admin/AdminHeader'; // Хедер для админа
import FavoritesPage from './components/user/FavoritesPage';
import CreateRecipePage from './components/user/CreateRecipePage';
import MyRecipesPage from './components/user/MyRecipesPage';
import UpdateRecipePage from './components/user/UpdateRecipePage';
import SearchByTagsPage from './components/user/SearchByTagsPage';
import UserProductPage from './components/user/UserProductPage';
import {jwtDecode} from 'jwt-decode';
import AdminPage from "./components/admin/AdminPage";
import AdminCreateRecipePage from "./components/admin/AdminCreateRecipePage";
import AdminUpdateRecipePage from "./components/admin/AdminUpdateRecipePage";
import AdminRecipePage from "./components/admin/AdminRecipesPage";
import AdminRecipesPage from "./components/admin/AdminRecipesPage";
import AdminProductPage from "./components/admin/AdminProducts";
import AdminTagPage from "./components/admin/AdminTagPage";
import AdminCategoryPage from "./components/admin/AdminCategoryPage";
import ProductPage from "./components/user/ProductPage";
import ProductsPage from "./components/user/ProductsPage";
import UserParametersForm  from "./components/user/UserParametersForm";
import AdminUserPage from "./components/admin/AdminUserPage";
import AdminUsersPage from "./components/admin/AdminUsersPage";
import UnwantedProductsForm from './components/user/UnwantedProductsForm';
import ConsumedProductsForm from './components/user/ConsumedProductsForm';
import MealPlanForm from './components/user/MealPlanForm';
import {refreshAccessToken} from "./api"; // Страница администратора

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState('');
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    const handleLoginSuccess = (token) => {
        Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'Strict' });
        setToken(token);
        setIsLoggedIn(true);

        try {
            const decodedToken = jwtDecode(token); // Декодируем токен
            const userRole = decodedToken.role; // Роль из токена
            setRole(userRole);
            if (userRole === 'admin') {
                navigate('/admin'); // Перенаправляем на страницу админа
            } else {
                navigate('/search'); // Перенаправляем на страницу для пользователей
            }
        } catch (error) {
            console.error('Invalid token', error);
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        setToken('');
        setRole('');
        setIsLoggedIn(false);
        navigate('/'); // Возврат на главную страницу
    };

    const handleNavigate = (page) => {
        navigate(`/${page}`);
    };

    useEffect(() => {
        const savedToken = Cookies.get('token');
        if (savedToken) {
            setToken(savedToken);
            setIsLoggedIn(true);

            // Декодируем и извлекаем роль
            try {
                const decodedToken = jwtDecode(savedToken);
                setRole(decodedToken.role);
            } catch (error) {
                console.error('Invalid token', error);
            }
        }
    }, []);

    const checkTokenExpirationAndRefresh = async () => {
        const savedToken = Cookies.get('token');
        const refreshToken = Cookies.get('refreshToken'); // Храните refreshToken в куках

        if (savedToken) {
            const decodedToken = jwtDecode(savedToken);
            const currentTime = Date.now() / 1000;

            // Если токен истекает в ближайшее время, обновляем его
            if (decodedToken.exp < currentTime + 60) { // Обновляем за минуту до истечения
                try {
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    Cookies.set('token', newAccessToken, { expires: 7, secure: true, sameSite: 'Strict' });
                    setToken(newAccessToken);
                    console.log(jwtDecode(token));
                } catch (error) {
                    console.error('Failed to refresh token:', error);
                    handleLogout(); // Если не удалось обновить, выполняем логаут
                }
            }
        }
    };
    useEffect(() => {
        const interval = setInterval(() => {
            checkTokenExpirationAndRefresh();
        }, 5 * 60 * 1000); // Проверяем каждые 5 минут
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="App">
            {isLoggedIn && (role === 'admin' ? (
                <AdminHeader onLogout={handleLogout} onNavigate={handleNavigate} /> // Используем AdminHeader для админа
            ) : (
                <Header onLogout={handleLogout} onNavigate={handleNavigate} token={token} /> // Обычный Header
            ))}
            <div className="form-container">
                <Routes>
                    {isLoggedIn ? (
                        <>
                            <Route path="/search" element={<SearchPage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/tags" element={<SearchByTagsPage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/create-recipe" element={<CreateRecipePage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/update-recipe/:recipeId" element={<UpdateRecipePage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/my-recipes" element={<MyRecipesPage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/recipe/:id" element={<RecipePage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/favorites" element={<FavoritesPage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/my-products" element={<UserProductPage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/products" element={<ProductsPage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/user-parameters/:userId" element={<UserParametersForm token={token} onNavigate={handleNavigate}/>} />
                            <Route path="/user-meal-plan" element={<MealPlanForm token={token} onNavigate={handleNavigate}/>} />
                            <Route path="/user-unwated-products/:userId" element={<UnwantedProductsForm token={token} onNavigate={handleNavigate}/>} />
                            <Route path="/user-consumed-products" element={<ConsumedProductsForm token={token} onNavigate={handleNavigate}/>} />
                            <Route path="/product/:productId" element={<ProductPage token={token} onNavigate={handleNavigate} />} />
                            <Route path="/admin" element={<AdminPage token={token} onNavigate={handleNavigate}/>} /> {/* Страница админа */}
                            <Route path="/admin/update-recipe/:recipeId" element={<AdminUpdateRecipePage token={token} onNavigate={handleNavigate}/>} /> {/* Страница админа */}
                            <Route path="/admin/create-recipe" element={<AdminCreateRecipePage token={token} onNavigate={handleNavigate}/>} /> {/* Страница админа */}
                            <Route path="/admin/recipes" element={<AdminRecipesPage token={token} onNavigate={handleNavigate}/> } /> {/* Страница админа */}
                            <Route path="/admin/products" element={<AdminProductPage token={token} onNavigate={handleNavigate}/> } /> {/* Страница админа */}
                            <Route path="/admin/tags" element={<AdminTagPage token={token} onNavigate={handleNavigate}/> } /> {/* Страница админа */}
                            <Route path="/admin/categorys" element={<AdminCategoryPage token={token} onNavigate={handleNavigate}/> } /> {/* Страница админа */}
                            <Route path="/admin/users" element={<AdminUsersPage token={token} onNavigate={handleNavigate}/> } /> {/* Страница админа */}
                            <Route path="/admin/user/:userId" element={<AdminUserPage token={token} onNavigate={handleNavigate}/> } /> {/* Страница админа */}
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
                            <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />} />
                            <Route path="/register" element={<RegisterForm onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />} />
                        </>
                    )}
                </Routes>
            </div>
        </div>
    );
}

export default App;
