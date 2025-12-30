const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get user profile (public)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.name,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update own profile (protected) - TEXT FIELDS ONLY
exports.updateProfile = async (req, res) => {
  try {
    const { bio, phone, website, facebook, instagram, twitter } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields (excluding profileImage - that's handled separately)
    user.profile = {
      bio: bio || user.profile.bio,
      phone: phone || user.profile.phone,
      website: website || user.profile.website,
      facebook: facebook || user.profile.facebook,
      instagram: instagram || user.profile.instagram,
      twitter: twitter || user.profile.twitter,
      profileImage: user.profile.profileImage, // Keep existing image
    };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: user.profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get own profile (protected)
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile image (protected) - NEW
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image if it exists
    if (user.profile.profileImage) {
      const oldImagePath = path.join(__dirname, '..', user.profile.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new image path (relative URL)
    user.profile.profileImage = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: user.profile.profileImage,
    });
  } catch (error) {
    console.error(error);
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete profile image (protected) - NEW
exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete image file from disk
    if (user.profile.profileImage) {
      const imagePath = path.join(__dirname, '..', user.profile.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove image path from database
    user.profile.profileImage = '';
    await user.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};