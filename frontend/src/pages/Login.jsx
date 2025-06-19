// frontend/src/pages/Login.jsx
// Login page for admin authentication

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading if auth is still being checked
  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="large" message="Checking authentication..." />
        </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoginLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('Login successful!');
        // Navigation will happen automatically via the auth context
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center"
            >
              <CogIcon className="h-8 w-8 text-white" />
            </motion.div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              CPQ Admin Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your product configurations
            </p>
          </div>

          {/* Demo Credentials Info */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Demo Credentials</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p><strong>Email:</strong> demo@cpq.local</p>
                  <p><strong>Password:</strong> demo123</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 space-y-6"
              onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    disabled={loginLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      disabled={loginLoading}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loginLoading}
                  >
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                  type="submit"
                  disabled={loginLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loginLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="small" color="white" showMessage={false} />
                      <span className="ml-2">Signing in...</span>
                    </div>
                ) : (
                    'Sign in'
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
          >
            <p className="text-xs text-gray-500">
              CPQ Enterprise Configuration System v1.0
            </p>
          </motion.div>
        </motion.div>
      </div>
  );
};

export default Login;