// frontend/src/pages/Login.jsx - Updated for Real JWT Authentication
// Works with the CPQ backend JWT authentication system

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EyeIcon,
  EyeSlashIcon,
  CommandLineIcon,
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth, DEMO_CREDENTIALS } from '../contexts/AuthContext';

// Validation schema - Updated for username instead of email
const loginSchema = z.object({
  username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters'),
  password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoAccount, setSelectedDemoAccount] = useState(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || '/dashboard';
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const result = await login(data.username, data.password);
      if (result.success) {
        // Navigation will be handled by the auth state change
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle demo account selection
  const handleDemoAccount = (accountType) => {
    const credentials = DEMO_CREDENTIALS[accountType];
    if (credentials) {
      setValue('username', credentials.username);
      setValue('password', credentials.password);
      setSelectedDemoAccount(accountType);
    }
  };

  // Clear demo selection when form changes
  const watchedValues = watch();
  useEffect(() => {
    if (selectedDemoAccount) {
      const selectedCredentials = DEMO_CREDENTIALS[selectedDemoAccount];
      if (
          watchedValues.username !== selectedCredentials.username ||
          watchedValues.password !== selectedCredentials.password
      ) {
        setSelectedDemoAccount(null);
      }
    }
  }, [watchedValues, selectedDemoAccount]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <CommandLineIcon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                CPQ Enterprise
              </h2>
              <p className="text-sm text-gray-600">
                Configure, Price, Quote System
              </p>
            </div>
          </motion.div>

          {/* Demo Credentials Card */}
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <h3 className="text-sm font-medium text-blue-900 mb-3">Demo Accounts</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DEMO_CREDENTIALS).map(([type, credentials]) => (
                  <button
                      key={type}
                      onClick={() => handleDemoAccount(type)}
                      className={`text-left p-2 rounded-md text-xs border transition-all ${
                          selectedDemoAccount === type
                              ? 'bg-blue-100 border-blue-300 text-blue-900'
                              : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                      }`}
                  >
                    <div className="font-medium capitalize">{type}</div>
                    <div className="text-blue-600">{credentials.username}</div>
                    <div className="text-blue-500 text-xs">Role: {credentials.role}</div>
                    {selectedDemoAccount === type && (
                        <CheckCircleIcon className="h-4 w-4 text-blue-600 mt-1" />
                    )}
                  </button>
              ))}
            </div>
            <div className="mt-3 text-xs text-blue-700">
              <div>• <strong>Admin:</strong> Full system access</div>
              <div>• <strong>User:</strong> Configuration and pricing</div>
              <div>• <strong>Demo:</strong> Limited configuration access</div>
              <div>• <strong>Test:</strong> Configuration and testing tools</div>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      {...register('username')}
                      type="text"
                      autoComplete="username"
                      required
                      className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                          errors.username
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg focus:z-10 text-sm`}
                      placeholder="Username"
                  />
                  {errors.username && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                  )}
                </div>
                {errors.username && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.username.message}
                    </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className={`appearance-none relative block w-full pl-10 pr-10 py-3 border ${
                          errors.password
                              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                      } rounded-lg focus:z-10 text-sm`}
                      placeholder="Password"
                  />
                  <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                  <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Login Failed
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          {error}
                        </div>
                      </div>
                    </div>
                  </motion.div>
              )}

              {/* Submit Button */}
              <div>
                <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {(isSubmitting || isLoading) ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                  ) : (
                      'Sign in'
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Features */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
          >
            <p className="text-xs text-gray-500 mb-4">
              Enterprise CPQ Features
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-400">
              <span>• Real-time Validation</span>
              <span>• Dynamic Pricing</span>
              <span>• Constraint Solving</span>
            </div>
          </motion.div>

          {/* Backend Status */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
          >
            <div className="inline-flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Backend: {import.meta.env.VITE_API_URL || 'http://localhost:8080'}
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default Login;