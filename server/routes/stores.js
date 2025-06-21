const express = require('express');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { sendSuccess, sendError } = require('../utils/response');
const { auth, authorize } = require('../middleware/auth');
const { validateStoreCreation, handleValidationErrors } = require('../validators/userValidator');

const router = express.Router();

// Get all stores (for normal users)
router.get('/', auth, async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const filters = {};
    if (name) filters.name = name;
    if (address) filters.address = address;

    let stores = await Store.getAll(filters);

    // Get user's ratings for each store if user is a normal user
    if (req.user.role === 'user') {
      for (let store of stores) {
        const userRating = await Rating.getUserRating(req.user.id, store.id);
        store.user_rating = userRating ? userRating.rating : null;
      }
    }

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

// Get store details
router.get('/:id', auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    // Get user's rating if user is a normal user
    if (req.user.role === 'user') {
      const userRating = await Rating.getUserRating(req.user.id, store.id);
      store.user_rating = userRating ? userRating.rating : null;
    }

    // Get store raters if user is store owner or admin
    if (req.user.role === 'admin' || (req.user.role === 'store_owner' && store.owner_id === req.user.id)) {
      store.raters = await Store.getStoreRaters(store.id);
    }

    sendSuccess(res, store);

  } catch (error) {
    console.error('Get store error:', error);
    sendError(res, 'Failed to fetch store', 500);
  }
});

// Create new store (admin only)
router.post('/', auth, authorize('admin'), validateStoreCreation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

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