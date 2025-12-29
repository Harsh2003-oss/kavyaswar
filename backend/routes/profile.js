const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Get public profile
router.get('/:userId', profileController.getProfile);

// Get my profile (protected)
router.get('/me/profile', auth, profileController.getMyProfile);

// Update my profile (protected)
router.put('/me/profile', auth, profileController.updateProfile);

module.exports = router;