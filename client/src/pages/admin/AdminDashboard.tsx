import React, { useState, useEffect } from 'react';
import { Users, Store, Star } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { DashboardStats } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await apiClient.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Stores',
      value: stats.totalStores,
      icon: Store,
      color: 'bg-green-500'
    },
    {
      title: 'Total Ratings',
      value: stats.totalRatings,
      icon: Star,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of platform statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${card.color} rounded-md p-3`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600">Add, view, and manage users</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-medium text-gray-900">Manage Stores</h3>
            <p className="text-sm text-gray-600">Add, view, and manage stores</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-medium text-gray-900">View Reports</h3>
            <p className="text-sm text-gray-600">Access detailed reports</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-medium text-gray-900">System Settings</h3>
            <p className="text-sm text-gray-600">Configure system settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};