import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, RootState } from './store/store';
import { useSelector } from 'react-redux';
import { setStore } from './api/axios';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';

// Set store reference for axios interceptors
setStore(store);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                            <LoginForm />
                        </div>
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                            <RegisterForm />
                        </div>
                    </PublicRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </Provider>
    );
};

export default App;
