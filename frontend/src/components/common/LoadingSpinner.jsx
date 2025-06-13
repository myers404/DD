import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  color = 'blue',
  showMessage = true,
  className = '' 
}) => {
  // Size configurations
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2', 
    large: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-4',
  };

  // Color configurations
  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600',
    purple: 'border-purple-200 border-t-purple-600',
    gray: 'border-gray-200 border-t-gray-600',
  };

  // Text size based on spinner size
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-lg',
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {/* Spinner */}
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        aria-label="Loading"
      />
      
      {/* Message */}
      {showMessage && message && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-3 text-gray-600 font-medium text-center ${textSizeClasses[size]}`}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

// Preset configurations for common use cases
export const CenteredSpinner = ({ message = 'Loading...', size = 'large' }) => (
  <div className="min-h-64 flex items-center justify-center">
    <LoadingSpinner size={size} message={message} />
  </div>
);

export const FullPageSpinner = ({ message = 'Loading application...', color = 'blue' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" message={message} color={color} />
  </div>
);

export const InlineSpinner = ({ size = 'small', color = 'blue' }) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    showMessage={false} 
    className="inline-flex"
  />
);

// Button spinner for loading states
export const ButtonSpinner = () => (
  <svg 
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Skeleton loader for content placeholders
export const SkeletonLoader = ({ className = 'h-4 w-full' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Card skeleton loader
export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  </div>
);

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;
