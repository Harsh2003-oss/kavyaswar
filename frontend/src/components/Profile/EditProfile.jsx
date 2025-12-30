import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

function EditProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/profile/me/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.profile) {
        setFormData({
          bio: response.data.profile.bio || '',
          phone: response.data.profile.phone || '',
          website: response.data.profile.website || '',
          facebook: response.data.profile.facebook || '',
          instagram: response.data.profile.instagram || '',
          twitter: response.data.profile.twitter || '',
        });
        setCurrentImage(response.data.profile.profileImage || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      alert('Please select an image first');
      return;
    }

    setUploadingImage(true);
    const formDataImage = new FormData();
    formDataImage.append('profileImage', profileImage);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/profile/me/profile/image',
        formDataImage,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setCurrentImage(response.data.imageUrl);
      setImagePreview('');
      setProfileImage(null);
      alert('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:3000/profile/me/profile/image', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCurrentImage('');
      setImagePreview('');
      setProfileImage(null);
      alert('Profile image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:3000/profile/me/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Profile Image Section */}
          <div className="border-b pb-6">
            <h3 className="text-xl font-bold mb-4">Profile Picture</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                {imagePreview || currentImage ? (
                  <img
                    src={imagePreview || `http://localhost:3000${currentImage}`}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-6xl">
                    👤
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Choose New Image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
                  </p>
                </div>

                <div className="flex gap-3">
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all"
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                  )}
                  
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setProfileImage(null);
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                  )}

                  {currentImage && !imagePreview && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                    >
                      Delete Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                About / Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell people about yourself..."
                maxLength="500"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Social Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    📘 Facebook
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourprofile"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    📷 Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    🐦 Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/yourprofile"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;