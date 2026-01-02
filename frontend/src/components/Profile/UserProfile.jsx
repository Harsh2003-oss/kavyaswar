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
      alert('Profile not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
        <div className="animate-pulse text-xl font-semibold">Loading profile…</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      
      {/* HEADER */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-90" />
        <div className="relative max-w-4xl mx-auto px-4 py-14 text-center text-white animate-fadeIn">
          
          {/* Avatar */}
          <div className="relative w-36 h-36 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 animate-spinSlow" />
            <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center overflow-hidden">
              {profile.profile?.profileImage ? (
                <img
                  src={`http://localhost:3000${profile.profile.profileImage}`}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-6xl">👤</span>
              )}
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-wide">
            {profile.name}
          </h1>
          <p className="mt-2 text-purple-200">
            ✍️ Poet • Member since {new Date(profile.createdAt).getFullYear()}
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-purple-600 hover:underline"
        >
          ← Back
        </button>

        {/* ABOUT */}
        {profile.profile?.bio && (
          <section className="glass-card animate-slideUp">
            <h2 className="section-title">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profile.profile.bio}
            </p>
          </section>
        )}

        {/* CONTACT */}
        <section className="glass-card animate-slideUp delay-200">
          <h2 className="section-title">Contact</h2>

          <div className="space-y-4">
            {profile.profile?.phone && (
              <ContactRow icon="📞" value={profile.profile.phone} link={`tel:${profile.profile.phone}`} />
            )}

            {profile.profile?.website && (
              <ContactRow icon="🌐" value={profile.profile.website} link={profile.profile.website} />
            )}

            {/* SOCIALS */}
            <div className="pt-6 flex gap-4">
              {profile.profile?.facebook && <Social icon="📘" link={profile.profile.facebook} />}
              {profile.profile?.instagram && <Social icon="📷" link={profile.profile.instagram} />}
              {profile.profile?.twitter && <Social icon="🐦" link={profile.profile.twitter} />}
            </div>

            {!profile.profile?.phone &&
              !profile.profile?.website &&
              !profile.profile?.facebook &&
              !profile.profile?.instagram &&
              !profile.profile?.twitter && (
                <p className="text-gray-500 text-center italic">
                  No contact information available
                </p>
              )}
          </div>
        </section>
      </div>

      {/* INLINE STYLES */}
      <style>{`
        .glass-card {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(12px);
          border-radius: 1.25rem;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .animate-spinSlow {
          animation: spin 12s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ContactRow({ icon, value, link }) {
  return (
    <div className="flex items-center gap-3 hover:translate-x-1 transition">
      <span className="text-2xl">{icon}</span>
      <a href={link} className="text-blue-600 hover:underline">
        {value}
      </a>
    </div>
  );
}

function Social({ icon, link }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white text-xl hover:scale-110 transition"
    >
      {icon}
    </a>
  );
}

export default UserProfile;
