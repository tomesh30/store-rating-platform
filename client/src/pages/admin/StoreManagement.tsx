import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { StarRating } from '../../components/common/StarRating';
import { Store, FilterOptions, SortConfig } from '../../types';
import { apiClient } from '../../utils/api';
import { validateName, validateEmail, validateAddress } from '../../utils/validation';

export const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [stores, filters, sortConfig]);

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

  const applyFiltersAndSort = () => {
    let filtered = [...stores];

    // Apply filters
    if (filters.name) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter(store => 
        store.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }
    if (filters.address) {
      filtered = filtered.filter(store => 
        store.address.toLowerCase().includes(filters.address!.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Store];
      const bValue = b[sortConfig.key as keyof Store];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStores(filtered);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateName(newStore.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.errors[0];
    }

    const emailValidation = validateEmail(newStore.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }

    const addressValidation = validateAddress(newStore.address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.errors[0];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await apiClient.createStore(newStore);
      if (response.success) {
        setShowAddModal(false);
        setNewStore({ name: '', email: '', address: '' });
        setErrors({});
        loadStores();
      } else {
        setErrors({ general: response.error || 'Failed to create store' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'rating', 
      label: 'Rating', 
      sortable: true,
      render: (value: number, row: Store) => (
        <div className="flex items-center space-x-2">
          <StarRating rating={value} readonly size="sm" />
          <span className="text-sm text-gray-500">({row.totalRatings})</span>
        </div>
      )
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600">Manage all stores in the system</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-2" />
          Add Store
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={16} />
          <span className="font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name"
            value={filters.name || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Search by email"
            value={filters.email || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input
            placeholder="Search by address"
            value={filters.address || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={filteredStores}
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyMessage="No stores found"
        />
      </div>

      {/* Add Store Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Store"
        size="md"
      >
        <form onSubmit={handleAddStore} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}
          
          <Input
            label="Store Name"
            value={newStore.name}
            onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={newStore.email}
            onChange={(e) => setNewStore(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={newStore.address}
              onChange={(e) => setNewStore(prev => ({ ...prev, address: e.target.value }))}
              className={`block w-full px-3 py-2 border rounded-md ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={3}
              required
            />
            {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Store
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};