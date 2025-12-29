const User = require('../models/User');

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

// Update own profile (protected)
exports.updateProfile = async (req, res) => {
  try {
    const { bio, phone, website, facebook, instagram, twitter, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    user.profile = {
      bio: bio || user.profile.bio,
      phone: phone || user.profile.phone,
      website: website || user.profile.website,
      facebook: facebook || user.profile.facebook,
      instagram: instagram || user.profile.instagram,
      twitter: twitter || user.profile.twitter,
      profileImage: profileImage || user.profile.profileImage,
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