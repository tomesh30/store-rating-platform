import React, { useState, useEffect } from 'react';
import { Star, Users } from 'lucide-react';
import { Table } from '../../components/common/Table';
import { StarRating } from '../../components/common/StarRating';
import { Rating } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const StoreDashboard: React.FC = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoreRatings();
  }, []);

  const loadStoreRatings = async () => {
    try {
      const response = await apiClient.getRatings();
      if (response.success && response.data) {
        // Filter ratings for this store owner's store
        const storeRatings = response.data.filter((rating: Rating) => 
          rating.storeId === user?.id // Assuming store owner ID matches store ID
        );
        
        setRatings(storeRatings);
        
        // Calculate average rating
        if (storeRatings.length > 0) {
          const total = storeRatings.reduce((sum: number, rating: Rating) => sum + rating.rating, 0);
          setAverageRating(total / storeRatings.length);
        }
      }
    } catch (error) {
      console.error('Failed to load store ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'userName', label: 'User Name', sortable: true },
    { 
      key: 'rating', 
      label: 'Rating', 
      sortable: true,
      render: (value: number) => <StarRating rating={value} readonly size="sm" />
    },
    { 
      key: 'createdAt', 
      label: 'Date', 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
        <p className="text-gray-600">View your store's ratings and feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-md p-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-semibold text-gray-900">
                  {averageRating.toFixed(1)}
                </p>
                <StarRating rating={averageRating} readonly size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ratings</p>
              <p className="text-2xl font-semibold text-gray-900">{ratings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customer Ratings</h2>
        </div>
        <Table
          columns={columns}
          data={ratings}
          emptyMessage="No ratings received yet"
        />
      </div>
    </div>
  );
};