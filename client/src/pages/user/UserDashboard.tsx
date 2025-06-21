import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { Modal } from '../../components/common/Modal';
import { Store, Rating } from '../../types';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, Rating>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [newRating, setNewRating] = useState(0);

  useEffect(() => {
    loadStores();
    loadUserRatings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stores, searchTerm]);

  const loadStores = async () => {
    try {
      const response = await apiClient.getStores();
      if (response.success && response.data) {
        setStores(response.data);
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRatings = async () => {
    try {
      const response = await apiClient.getRatings();
      if (response.success && response.data) {
        const ratingsMap: Record<string, Rating> = {};
        response.data.forEach((rating: Rating) => {
          if (rating.userId === user?.id) {
            ratingsMap[rating.storeId] = rating;
          }
        });
        setUserRatings(ratingsMap);
      }
    } catch (error) {
      console.error('Failed to load user ratings:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...stores];

    if (searchTerm) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  const handleRateStore = (store: Store) => {
    setSelectedStore(store);
    setNewRating(userRatings[store.id]?.rating || 0);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedStore || newRating === 0) return;

    try {
      const existingRating = userRatings[selectedStore.id];
      
      if (existingRating) {
        // Update existing rating
        await apiClient.updateRating(existingRating.id, newRating);
      } else {
        // Submit new rating
        await apiClient.submitRating(selectedStore.id, newRating);
      }

      setShowRatingModal(false);
      setSelectedStore(null);
      setNewRating(0);
      loadStores();
      loadUserRatings();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Store Directory</h1>
        <p className="text-gray-600">Browse and rate stores</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-4">
          <Search size={16} />
          <span className="font-medium">Search Stores</span>
        </div>
        <Input
          placeholder="Search by store name or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => {
          const userRating = userRatings[store.id];
          
          return (
            <div key={store.id} className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                  <p className="text-sm text-gray-600">{store.address}</p>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                    <StarRating rating={store.rating} readonly size="sm" />
                  </div>
                  
                  {userRating && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                      <StarRating rating={userRating.rating} readonly size="sm" />
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleRateStore(store)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Star size={16} className="mr-2" />
                  {userRating ? 'Update Rating' : 'Rate Store'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No stores found matching your search.</p>
        </div>
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title={`Rate ${selectedStore?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">How would you rate this store?</p>
            <StarRating
              rating={newRating}
              onRatingChange={setNewRating}
              size="lg"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRatingModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRating}
              disabled={newRating === 0}
            >
              Submit Rating
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};