import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/profile/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Profile not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-4">
            {profile.profile?.profileImage ? (
              <img
                src={profile.profile.profileImage}
                alt={profile.name}
                className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto bg-white/20 flex items-center justify-center text-6xl">
                👤
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
          <p className="text-purple-200">
            Poet • Member since {new Date(profile.createdAt).getFullYear()}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
        >
          ← Back
        </button>

        {/* About */}
        {profile.profile?.bio && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">About</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {profile.profile.bio}
            </p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Contact Information
          </h2>

          <div className="space-y-4">
            {profile.profile?.phone && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <a
                  href={`tel:${profile.profile.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {profile.profile.phone}
                </a>
              </div>
            )}

            {profile.profile?.website && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <a
                  href={profile.profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {profile.profile.website}
                </a>
              </div>
            )}

            {/* Social Media */}
            <div className="pt-4 border-t">
              <div className="flex gap-4">
                {profile.profile?.facebook && (
                  <a
                    href={profile.profile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center"
                  >
                    📘
                  </a>
                )}

                {profile.profile?.instagram && (
                  <a
                    href={profile.profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-pink-600 text-white rounded-lg flex items-center justify-center"
                  >
                    📷
                  </a>
                )}

                {profile.profile?.twitter && (
                  <a
                    href={profile.profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-sky-500 text-white rounded-lg flex items-center justify-center"
                  >
                    🐦
                  </a>
                )}
              </div>
            </div>

            {!profile.profile?.phone &&
              !profile.profile?.website &&
              !profile.profile?.facebook &&
              !profile.profile?.instagram &&
              !profile.profile?.twitter && (
                <p className="text-gray-500 text-center">
                  No contact information available
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
