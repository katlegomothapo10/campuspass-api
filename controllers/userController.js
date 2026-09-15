const User = require('../models/User');

// Get current user profile
const getMe = (req, res) => {
  try {
    const user = User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const safeUser = User.getSafeUser(user);

    res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Update user profile
const updateMe = (req, res) => {
  try {
    const { name, email, studentNumber } = req.body;
    const userId = req.user.id;

    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user (we'll add this method to User model)
    const updatedUser = User.update(userId, name, email, studentNumber);
    const safeUser = User.getSafeUser(updatedUser);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  getMe,
  updateMe
};