// frontend/src/components/layout/Sidebar.jsx
// Admin navigation sidebar

import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  Cog6ToothIcon,
  RectangleStackIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { modelId } = useParams();
  const { logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'System overview'
    },
    {
      name: 'Models',
      href: '/models',
      icon: CubeIcon,
      description: 'Manage product models'
    }
  ];

  // Add model-specific navigation when in model context
  if (modelId) {
    navigation.push(
        {
          name: 'Model Builder',
          href: `/models/${modelId}`,
          icon: Cog6ToothIcon,
          description: 'Edit model configuration'
        },
        {
          name: 'Configurations',
          href: `/models/${modelId}/configurations`,
          icon: RectangleStackIcon,
          description: 'View user configurations'
        }
    );
  }

  return (
      <div className="flex flex-col h-full bg-gray-900">
        {/* Logo/Brand */}
        <div className="flex items-center h-16 px-4 bg-gray-800">
          <h1 className="text-xl font-bold text-white">CPQ Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => (
              <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                  }
              >
                <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                />
                <div className="flex-1">
                  <div>{item.name}</div>
                  {item.description && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                  )}
                </div>
              </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-800">
          <button
              onClick={logout}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            <ArrowLeftOnRectangleIcon
                className="mr-3 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
            />
            Logout
          </button>
        </div>
      </div>
  );
};

export default Sidebar;