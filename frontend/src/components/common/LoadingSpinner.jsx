// frontend/src/components/common/LoadingSpinner.jsx
// Enhanced production-ready loading component with multiple variants

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
                            size = 'medium',
                            color = 'blue',
                            message = null,
                            fullScreen = false,
                            overlay = false,
                            className = '',
                            variant = 'spinner'
                        }) => {
    // Size configurations
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    // Color configurations
    const colorClasses = {
        blue: 'text-blue-600',
        gray: 'text-gray-600',
        white: 'text-white',
        green: 'text-green-600',
        red: 'text-red-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600'
    };

    // Get appropriate classes
    const spinnerSize = sizeClasses[size] || sizeClasses.medium;
    const spinnerColor = colorClasses[color] || colorClasses.blue;

    // Spinner variants
    const SpinnerVariants = {
        // Traditional rotating spinner
        spinner: (
            <motion.div
                className={`${spinnerSize} ${spinnerColor} ${className}`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                <svg
                    className="w-full h-full"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="31.416"
                        strokeDashoffset="31.416"
                        strokeLinecap="round"
                        className="opacity-20"
                    />
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="31.416"
                        strokeDashoffset="23.562"
                        strokeLinecap="round"
                        className="opacity-100"
                    />
                </svg>
            </motion.div>
        ),

        // Pulsing dots
        dots: (
            <div className={`flex space-x-1 ${className}`}>
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className={`${size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full ${spinnerColor.replace('text-', 'bg-')}`}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.5, 1]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                    />
                ))}
            </div>
        ),

        // Bouncing bars
        bars: (
            <div className={`flex items-end space-x-1 ${className}`}>
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className={`${size === 'xs' ? 'w-0.5' : size === 'sm' ? 'w-1' : 'w-1.5'} ${spinnerColor.replace('text-', 'bg-')}`}
                        style={{
                            height: size === 'xs' ? '8px' : size === 'sm' ? '12px' : '16px'
                        }}
                        animate={{
                            scaleY: [1, 2, 1]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1
                        }}
                    />
                ))}
            </div>
        ),

        // Pulse circle
        pulse: (
            <motion.div
                className={`${spinnerSize} rounded-full ${spinnerColor.replace('text-', 'bg-')} ${className}`}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity
                }}
            />
        ),

        // Loading text with animated dots
        text: message && (
            <div className={`flex items-center space-x-2 ${className}`}>
        <span className={`text-sm font-medium ${spinnerColor}`}>
          {message}
        </span>
                <div className="flex space-x-0.5">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className={`w-1 h-1 rounded-full ${spinnerColor.replace('text-', 'bg-')}`}
                            animate={{
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                        />
                    ))}
                </div>
            </div>
        )
    };

    // Get the spinner component
    const SpinnerComponent = SpinnerVariants[variant] || SpinnerVariants.spinner;

    // Wrapper content
    const content = (
        <div className={`flex flex-col items-center justify-center space-y-3 ${
            fullScreen ? 'min-h-screen' : ''
        }`}>
            {SpinnerComponent}

            {message && variant !== 'text' && (
                <motion.p
                    className={`text-sm font-medium ${spinnerColor} text-center max-w-xs`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );

    // Full screen overlay
    if (fullScreen || overlay) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`
          fixed inset-0 z-50 flex items-center justify-center
          ${overlay ? 'bg-black bg-opacity-50' : 'bg-white'}
        `}
            >
                {content}
            </motion.div>
        );
    }

    return content;
};

// Specialized loading components
export const LoadingCard = ({ message = "Loading...", className = "" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-8 ${className}`}>
        <LoadingSpinner
            size="large"
            message={message}
            variant="spinner"
        />
    </div>
);

export const LoadingTable = ({ rows = 5, columns = 4, className = "" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
        {/* Header skeleton */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
            </div>
        </div>

        {/* Rows skeleton */}
        <div className="divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="px-6 py-4">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className="h-4 bg-gray-200 rounded animate-pulse"
                                style={{
                                    animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const LoadingButton = ({ children, isLoading, size = 'medium', ...props }) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-sm',
        large: 'px-6 py-3 text-base'
    };

    return (
        <button
            {...props}
            disabled={isLoading || props.disabled}
            className={`
        inline-flex items-center justify-center font-medium rounded-md
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${props.className || 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}
      `}
        >
            {isLoading && (
                <LoadingSpinner
                    size={size === 'sm' ? 'xs' : 'sm'}
                    color="white"
                    className="mr-2"
                />
            )}
            {children}
        </button>
    );
};

// Skeleton component for content loading
export const Skeleton = ({
                             width = 'w-full',
                             height = 'h-4',
                             className = '',
                             animate = true
                         }) => (
    <div
        className={`
      ${width} ${height} bg-gray-200 rounded
      ${animate ? 'animate-pulse' : ''}
      ${className}
    `}
    />
);

// Loading state for forms
export const LoadingForm = ({ fields = 3, className = "" }) => (
    <div className={`space-y-4 ${className}`}>
        {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton width="w-20" height="h-4" />
                <Skeleton width="w-full" height="h-10" />
            </div>
        ))}
        <div className="flex space-x-3 pt-4">
            <Skeleton width="w-20" height="h-10" />
            <Skeleton width="w-16" height="h-10" />
        </div>
    </div>
);

// Loading state for charts
export const LoadingChart = ({ className = "" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="space-y-4">
            <Skeleton width="w-32" height="h-6" />
            <div className="h-64 bg-gray-100 rounded flex items-end justify-center space-x-2 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="bg-gray-300 rounded-t"
                        style={{
                            width: '20px',
                            height: `${Math.random() * 150 + 50}px`
                        }}
                        animate={{
                            opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// Hook for managing loading states
export const useLoading = (initialState = false) => {
    const [isLoading, setIsLoading] = React.useState(initialState);

    const withLoading = React.useCallback(async (asyncFunction) => {
        setIsLoading(true);
        try {
            const result = await asyncFunction();
            return result;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        setIsLoading,
        withLoading
    };
};

export default LoadingSpinner;