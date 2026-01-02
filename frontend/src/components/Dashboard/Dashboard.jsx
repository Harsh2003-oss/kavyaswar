import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { poemAPI } from '../../utils/api';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchPoems();
  }, []);

  const fetchPoems = async () => {
    try {
      setLoading(true);
      const response = await poemAPI.getAll();
      setPoems(response.data.poems);
    } catch (error) {
      console.error('Error fetching poems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this poem?')) {
      try {
        await poemAPI.delete(id);
        setPoems(poems.filter(poem => poem._id !== id));
      } catch (error) {
        alert('Failed to delete poem');
      }
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const response = await poemAPI.search(searchQuery);
      setPoems(response.data.poems);
    } else {
      fetchPoems();
    }
  };

  const copyShareLink = (shareableLink) => {
    if (!shareableLink) return;
    const url = `${window.location.origin}/share/${shareableLink}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied ✨');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white">
        <div className="text-2xl animate-pulse">Loading your poetry...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-pink-50">
      {/* HEADER */}
      <header className="relative bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-wide">My Poems</h1>
            <p className="text-white/80 italic mt-1">Let your words breathe ✨</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-5 py-3 bg-white/20 rounded-full hover:bg-white hover:text-purple-700 transition-all"
            >
              👤 {user?.name}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl z-50">
                <button
                  onClick={() => navigate(`/profile/${user?._id}`)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 text-black"
                >
                  👁️ View Profile
                </button>
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 text-black"
                >
                  ✏️ Edit Profile
                </button>
                <div className="border-t" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mb-12">
          <div className="relative w-full sm:w-[420px]">
            <input
              type="text"
              placeholder="Search emotions, words, feelings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-6 py-4 rounded-full shadow-md focus:ring-4 focus:ring-purple-300 outline-none"
            />
            <span className="absolute right-6 top-4">🔍</span>
          </div>

          <button
            onClick={() => navigate('/create-poem')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:scale-105 transition"
          >
            ✍️ Write New Poem
          </button>
        </div>

        {/* EMPTY STATE */}
        {poems.length === 0 ? (
          <div className="text-center py-32 bg-white/70 backdrop-blur rounded-3xl shadow-xl">
            <h2 className="text-4xl font-bold mb-4">Your canvas is empty 🎨</h2>
            <p className="text-gray-600 mb-8 italic">Start with a thought, end with a poem</p>
            <button
              onClick={() => navigate('/create-poem')}
              className="px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold hover:scale-105 transition"
            >
              Create First Poem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {poems.map(poem => (
              <div
                key={poem._id}
                className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all p-6 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold group-hover:text-purple-700 transition">
                    {poem.title}
                  </h3>
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${
                      poem.isPublic
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {poem.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>

                <p className="text-gray-600 italic line-clamp-4">
                  {poem.content}
                </p>

                {poem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {poem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-6 text-sm text-gray-500">
                  <span>👁️ {poem.views || 0}</span>
                  <span>❤️ {poem.likes || 0}</span>
                </div>

                <div className="flex gap-2 pt-4 mt-auto border-t">
                  <button
                    onClick={() => navigate(`/poem/${poem._id}`)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/edit-poem/${poem._id}`)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full py-2"
                  >
                    Edit
                  </button>
                  {poem.isPublic && (
                    <button
                      onClick={() => copyShareLink(poem.shareableLink)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full py-2"
                    >
                      Share
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(poem._id)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4"
                  >
                    🗑️
                  </button>
                </div>

                <div className="text-xs text-gray-400 text-right">
                  {new Date(poem.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
