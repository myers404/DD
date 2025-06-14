import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Page Components
import Dashboard from './pages/Dashboard';
import CustomerConfigurator from './pages/CustomerConfigurator';
import ModelBuilder from './pages/ModelBuilder.jsx';
import Login from './pages/Login';
import ModelSelection from './pages/ModelSelection'; // Add this import


// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigurationProvider } from './contexts/ConfigurationContext';

// Styles
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main Layout Component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigurationProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Customer Configurator */}
                <Route
                  path="/configure/:modelId?"
                  element={
                    <ProtectedRoute>
                      <CustomerConfigurator />
                    </ProtectedRoute>
                  }
                />
                
                {/* Model Builder - Admin Only */}
                  <Route path="/model-builder" element={
                      <ProtectedRoute requiredPermission="model_builder">
                          <ModelSelection />
                      </ProtectedRoute>
                  } />
                <Route
                  path="/model-builder/:modelId?"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ModelBuilder />
                    </ProtectedRoute>
                  }
                />
                
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 Page */}
                <Route 
                  path="*" 
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-gray-600 mb-4">Page not found</p>
                        <button 
                          onClick={() => window.history.back()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </Layout>
            
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </Router>
        </ConfigurationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
