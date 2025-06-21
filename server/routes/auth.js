const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { 
  validateRegistration, 
  validateLogin, 
  validatePasswordUpdate,
  handleValidationErrors 
} = require('../validators/userValidator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendError(res, 'User already exists with this email', 400);
    }

    // Create new user
    const userId = await User.create({ name, email, password, address, role: 'user' });
    
    // Generate token
    const token = generateToken({ id: userId, email, role: 'user' });

    sendSuccess(res, {
      token,
      user: { id: userId, name, email, address, role: 'user' }
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Registration failed', 500);
  }
});

// Login user
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    sendError(res, 'Failed to fetch profile', 500);
  }
});

// Update password
router.put('/update-password', auth, validatePasswordUpdate, handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const user = await User.findById(req.user.id);
    const isCurrentPasswordValid = await User.comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    // Update password
    await User.updatePassword(req.user.id, newPassword);

    sendSuccess(res, null, 'Password updated successfully');

  } catch (error) {
    console.error('Password update error:', error);
    sendError(res, 'Failed to update password', 500);
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  sendSuccess(res, null, 'Logout successful');
});

module.exports = router;