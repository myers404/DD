// frontend/src/components/common/LoadingSpinner.jsx
// Reusable loading spinner component - fully functional implementation

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
                          size = 'medium',
                          message = 'Loading...',
                          showMessage = true,
                          color = 'blue',
                          className = '',
                          fullScreen = false
                        }) => {
  // Size configurations
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  // Color configurations
  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    indigo: 'border-indigo-600'
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  const spinnerElement = (
      <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`
        ${sizeClasses[size]} 
        border-4 
        ${colorClasses[color]} 
        border-t-transparent 
        rounded-full
        ${className}
      `}
      />
  );

  const content = (
      <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'min-h-screen' : ''}`}>
        {spinnerElement}
        {showMessage && message && (
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`${textSizeClasses[size]} ${textColorClasses[color]} font-medium`}
            >
              {message}
            </motion.p>
        )}
      </div>
  );

  if (fullScreen) {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
          {content}
        </div>
    );
  }

  return content;
};

export default LoadingSpinner;