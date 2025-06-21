const express = require('express');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { sendSuccess, sendError } = require('../utils/response');
const { auth, authorize } = require('../middleware/auth');
const { validateRegistration, validateStoreCreation, handleValidationErrors } = require('../validators/userValidator');

const router = express.Router();

// Admin dashboard statistics
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.getTotalCount(),
      Store.getTotalCount(),
      Rating.getTotalCount()
    ]);

    const dashboardData = {
      totalUsers,
      totalStores,
      totalRatings
    };

    sendSuccess(res, dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    sendError(res, 'Failed to fetch dashboard data', 500);
  }
});

// Get all users with filters and sorting
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const filters = {};
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (address) filters.address = address;
    if (role) filters.role = role;

    let users = await User.getAll(filters);

    // Add rating info for store owners
    for (let user of users) {
      if (user.role === 'store_owner') {
        const store = await Store.findByOwnerId(user.id);
        user.store_rating = store ? parseFloat(store.average_rating) : 0;
      }
    }

    // Sort users
    users.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    sendSuccess(res, users);

  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, 'Failed to fetch users', 500);
  }
});

// Get user details by ID
router.get('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Remove password from response
    delete user.password;

    // Add store info if user is store owner
    if (user.role === 'store_owner') {
      const store = await Store.findByOwnerId(user.id);
      user.store = store || null;
    }

    sendSuccess(res, user);

  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, 'Failed to fetch user', 500);
  }
});

// Create new user (admin can create any type of user)
router.post('/users', auth, authorize('admin'), validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendError(res, 'User already exists with this email', 400);
    }

    // Validate role
    const validRoles = ['admin', 'user', 'store_owner'];
    if (!validRoles.includes(role)) {
      return sendError(res, 'Invalid user role', 400);
    }

    // Create new user
    const userId = await User.create({ name, email, password, address, role });
    const user = await User.findById(userId);
    
    // Remove password from response
    delete user.password;

    sendSuccess(res, user, 'User created successfully', 201);

  } catch (error) {
    console.error('Create user error:', error);
    sendError(res, 'Failed to create user', 500);
  }
});

// Get all stores with filters and sorting (admin view)
router.get('/stores', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, email, address, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    const filters = {};
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (address) filters.address = address;

    let stores = await Store.getAll(filters);

    // Sort stores
    stores.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    sendSuccess(res, stores);

  } catch (error) {
    console.error('Get stores error:', error);
    sendError(res, 'Failed to fetch stores', 500);
  }
});

// Create new store (admin only)
router.post('/stores', auth, authorize('admin'), validateStoreCreation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Validate owner if provided
    if (owner_id) {
      const owner = await User.findById(owner_id);
      if (!owner || owner.role !== 'store_owner') {
        return sendError(res, 'Invalid store owner', 400);
      }
    }

    const storeId = await Store.create({ name, email, address, owner_id });
    const store = await Store.findById(storeId);

    sendSuccess(res, store, 'Store created successfully', 201);

  } catch (error) {
    console.error('Create store error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(res, 'Store with this email already exists', 400);
    }
    sendError(res, 'Failed to create store', 500);
  }
});

module.exports = router;
