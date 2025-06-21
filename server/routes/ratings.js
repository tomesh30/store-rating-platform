const express = require('express');
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { sendSuccess, sendError } = require('../utils/response');
const { auth, authorize } = require('../middleware/auth');
const { validateRating, handleValidationErrors } = require('../validators/userValidator');

const router = express.Router();

// Submit or update rating (normal users only)
router.post('/', auth, authorize('user'), validateRating, handleValidationErrors, async (req, res) => {
  try {
    const { store_id, rating } = req.body;

    // Check if store exists
    const store = await Store.findById(store_id);
    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    // Create or update rating
    await Rating.create({
      user_id: req.user.id,
      store_id,
      rating
    });

    // Get updated user rating
    const userRating = await Rating.getUserRating(req.user.id, store_id);

    sendSuccess(res, userRating, 'Rating submitted successfully');

  } catch (error) {
    console.error('Submit rating error:', error);
    sendError(res, 'Failed to submit rating', 500);
  }
});

// Get user's rating for a specific store
router.get('/store/:storeId', auth, authorize('user'), async (req, res) => {
  try {
    const { storeId } = req.params;

    const rating = await Rating.getUserRating(req.user.id, storeId);

    sendSuccess(res, rating);

  } catch (error) {
    console.error('Get user rating error:', error);
    sendError(res, 'Failed to fetch rating', 500);
  }
});

// Get all ratings for a store (store owners and admins)
router.get('/store/:storeId/all', auth, async (req, res) => {
  try {
    const { storeId } = req.params;

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    // Check permissions
    if (req.user.role !== 'admin' && (req.user.role !== 'store_owner' || store.owner_id !== req.user.id)) {
      return sendError(res, 'Access denied', 403);
    }

    const ratings = await Rating.getStoreRatings(storeId);

    sendSuccess(res, ratings);

  } catch (error) {
    console.error('Get store ratings error:', error);
    sendError(res, 'Failed to fetch store ratings', 500);
  }
});

module.exports = router;