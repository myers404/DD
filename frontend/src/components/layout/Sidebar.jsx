import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  Cog8ToothIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CogIcon as CogIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UsersIcon as UsersIconSolid,
  Cog8ToothIcon as Cog8ToothIconSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useConfiguration } from '../../contexts/ConfigurationContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const { models, currentModel } = useConfiguration();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      current: location.pathname === '/dashboard',
      permission: null,
    },
    {
      name: 'Configure',
      href: '/configure',
      icon: CogIcon,
      iconSolid: CogIconSolid,
      current: location.pathname.startsWith('/configure'),
      permission: 'configurations',
      badge: models?.length || 0,
    },
    {
      name: 'Model Builder',
      href: '/model-builder',
      icon: WrenchScrewdriverIcon,
      iconSolid: WrenchScrewdriverIconSolid,
      current: location.pathname.startsWith('/model-builder'),
      permission: 'model_builder',
      adminOnly: true,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      current: location.pathname.startsWith('/analytics'),
      permission: 'analytics',
    },
    {
      name: 'Documentation',
      href: '/documentation',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid,
      current: location.pathname.startsWith('/documentation'),
      permission: null,
    },
  ];

  // Admin-only items
  const adminItems = [
    {
      name: 'Users',
      href: '/users',
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
      current: location.pathname.startsWith('/users'),
      permission: 'users',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog8ToothIcon,
      iconSolid: Cog8ToothIconSolid,
      current: location.pathname.startsWith('/settings'),
      permission: 'settings',
    },
  ];

  // Filter items based on permissions
  const filteredNavItems = navigationItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  const filteredAdminItems = adminItems.filter(item => {
    if (user?.role !== 'admin') return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  // Quick access models
  const quickAccessModels = models?.slice(0, 3) || [];

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <CommandLineIcon className="h-6 w-6 text-blue-400" />
              <span className="font-semibold text-lg">Navigation</span>
            </motion.div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Primary navigation */}
        <div className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.current ? item.iconSolid : item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.current
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className={`flex-shrink-0 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Badge */}
                {!isCollapsed && item.badge !== undefined && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
                      item.current
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                    }`}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Access Models */}
        {!isCollapsed && quickAccessModels.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Quick Access
            </h3>
            <div className="mt-2 space-y-1">
              {quickAccessModels.map((model) => (
                <Link
                  key={model.id}
                  to={`/configure/${model.id}`}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentModel?.id === model.id
                      ? 'bg-gray-800 text-blue-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    currentModel?.id === model.id ? 'bg-blue-400' : 'bg-gray-600 group-hover:bg-gray-500'
                  }`} />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {model.name}
                  </motion.span>
                </Link>
              ))}
              
              {models?.length > 3 && (
                <Link
                  to="/configure"
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                  <div className="w-2 h-2 rounded-full mr-3 bg-gray-600 group-hover:bg-gray-500" />
                  <span className="text-xs">View all ({models.length})</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Admin section */}
        {filteredAdminItems.length > 0 && (
          <div className={`${isCollapsed ? 'mt-4' : 'mt-8'}`}>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administration
              </h3>
            )}
            <div className={`${isCollapsed ? '' : 'mt-2'} space-y-1`}>
              {filteredAdminItems.map((item) => {
                const Icon = item.current ? item.iconSolid : item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className={`flex-shrink-0 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-3"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {/* User info */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-3 mb-3"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role || 'user'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Help link */}
        <Link
          to="/help"
          className={`group flex items-center px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors ${
            location.pathname === '/help' ? 'bg-gray-800 text-white' : ''
          }`}
          title={isCollapsed ? 'Help & Support' : ''}
        >
          <QuestionMarkCircleIcon className="flex-shrink-0 h-5 w-5" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3"
              >
                Help & Support
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Version info */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 px-3 py-2 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>CPQ Enterprise</span>
              <span>v1.0.0</span>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-500">All systems operational</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
