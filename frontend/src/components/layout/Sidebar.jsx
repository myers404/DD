// frontend/src/components/layout/Sidebar.jsx
// Admin navigation sidebar

import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
    HomeIcon,
    CubeIcon,
    Cog6ToothIcon,
    RectangleStackIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const { modelId } = useParams();

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
        <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
            <nav className="p-4 space-y-2">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <div>
                            <div>{item.name}</div>
                            {item.description && (
                                <div className="text-xs text-gray-500">{item.description}</div>
                            )}
                        </div>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;