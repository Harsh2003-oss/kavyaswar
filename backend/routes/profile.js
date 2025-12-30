const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// Get public profile
router.get('/:userId', profileController.getProfile);

// Get my profile (protected)
router.get('/me/profile', auth, profileController.getMyProfile);

// Update my profile - text fields only (protected)
router.put('/me/profile', auth, profileController.updateProfile);

// Upload profile image (protected) - NEW
router.post('/me/profile/image', auth, upload.single('profileImage'), profileController.uploadProfileImage);

// Delete profile image (protected) - NEW
router.delete('/me/profile/image', auth, profileController.deleteProfileImage);

module.exports = router;