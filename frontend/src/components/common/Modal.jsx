// frontend/src/components/common/Modal.jsx
// Simple modal component

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({
                 isOpen,
                 onClose,
                 title,
                 children,
                 variant = 'default'
               }) => {
  if (!isOpen) return null;

  const headerColorClass = variant === 'danger'
      ? 'bg-red-50 border-red-200'
      : 'bg-gray-50 border-gray-200';

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay */}
          <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
          ></div>

          {/* Modal panel */}
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            {/* Header */}
            <div className={`px-6 py-4 border-b ${headerColorClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Modal;