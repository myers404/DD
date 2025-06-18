
// frontend/src/App.jsx
// Main application component with admin-only routes

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/layout/Layout';

// Pages - Admin Only
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModelSelection from './pages/ModelSelection';
import ModelBuilder from './pages/ModelBuilder';
import ConfigurationsList from './pages/ConfigurationsList';

// Auth Provider
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Admin Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Default redirect to dashboard */}
                            <Route index element={<Navigate to="/dashboard" replace />} />

                            {/* Dashboard */}
                            <Route path="dashboard" element={<Dashboard />} />

                            {/* Model Management */}
                            <Route path="models" element={<ModelSelection />} />
                            <Route path="models/:modelId" element={<ModelBuilder />} />
                            <Route path="models/:modelId/configurations" element={<ConfigurationsList />} />

                            {/* Catch all - redirect to dashboard */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Routes>
                </Router>

                {/* Global toast notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;