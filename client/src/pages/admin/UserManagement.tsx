import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { User, FilterOptions, SortConfig } from '../../types';
import { apiClient } from '../../utils/api';
import { validateName, validateEmail, validatePassword, validateAddress } from '../../utils/validation';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [users, filters, sortConfig]);

  const loadUsers = async () => {
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...users];

    // Apply filters
    if (filters.name) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    if (filters.email) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }
    if (filters.address) {
      filtered = filtered.filter(user => 
        user.address.toLowerCase().includes(filters.address!.toLowerCase())
      );
    }
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof User];
      const bValue = b[sortConfig.key as keyof User];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateName(newUser.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.errors[0];
    }

    const emailValidation = validateEmail(newUser.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors[0];
    }

    const passwordValidation = validatePassword(newUser.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    const addressValidation = validateAddress(newUser.address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.errors[0];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await apiClient.createUser(newUser);
      if (response.success) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', address: '', password: '', role: 'user' });
        setErrors({});
        loadUsers();
      } else {
        setErrors({ general: response.error || 'Failed to create user' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { 
      key: 'role', 
      label: 'Role', 
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'admin' ? 'bg-red-100 text-red-800' :
          value === 'store_owner' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value === 'admin' ? 'Admin' : value === 'store_owner' ? 'Store Owner' : 'User'}
        </span>
      )
    }
  ];

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'store_owner', label: 'Store Owner' },
    { value: 'user', label: 'User' }
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={16} />
          <span className="font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Select
            options={roleOptions}
            value={filters.role || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            placeholder="Filter by role"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          data={filteredUsers}
          sortConfig={sortConfig}
          onSort={handleSort}
          emptyMessage="No users found"
        />
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}
          
          <Input
            label="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={newUser.address}
              onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
              className={`block w-full px-3 py-2 border rounded-md ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={3}
              required
            />
            {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
          </div>
          
          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
            error={errors.password}
            required
          />
          
          <Select
            label="Role"
            options={[
              { value: 'user', label: 'Normal User' },
              { value: 'store_owner', label: 'Store Owner' },
              { value: 'admin', label: 'Admin' }
            ]}
            value={newUser.role}
            onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
            required
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};