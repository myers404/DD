// frontend/src/components/common/LoadingSpinner.jsx
// Loading spinner component - was missing and causing Dashboard to break

import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
                            size = 'medium',
                            message = 'Loading...',
                            color = 'blue',
                            showMessage = true
                        }) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        medium: 'h-8 w-8',
        large: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const colorClasses = {
        blue: 'border-blue-600',
        gray: 'border-gray-600',
        white: 'border-white',
        green: 'border-green-600',
        red: 'border-red-600'
    };

    const textSizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xl: 'text-xl'
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <motion.div
                className={`
          ${sizeClasses[size]} 
          border-2 
          ${colorClasses[color]} 
          border-t-transparent 
          rounded-full
        `}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {showMessage && message && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`
            mt-3 
            ${textSizeClasses[size]} 
            text-gray-600 
            font-medium
          `}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;