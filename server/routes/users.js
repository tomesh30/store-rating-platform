const express = require('express');
const Store = require('../models/Store');
const { sendSuccess, sendError } = require('../utils/response');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Store owner dashboard
router.get('/store-dashboard', auth, authorize('store_owner'), async (req, res) => {
  try {
    // Get store owned by this user
    const store = await Store.findByOwnerId(req.user.id);
    if (!store) {
      return sendError(res, 'No store found for this owner', 404);
    }

    // Get users who rated this store
    const raters = await Store.getStoreRaters(store.id);

    const dashboardData = {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        average_rating: parseFloat(store.average_rating),
        total_ratings: store.total_ratings
      },
      raters
    };

    sendSuccess(res, dashboardData);

  } catch (error) {
    console.error('Store dashboard error:', error);
    sendError(res, 'Failed to fetch store dashboard', 500);
  }
});

module.exports = router;