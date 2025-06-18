// frontend/src/components/layout/Navbar.jsx
// Top navigation bar for admin interface

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <CogIcon className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">
                  CPQ Admin
                </span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                {user?.username || 'Admin'}
              </div>

              <button
                  onClick={logout}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;