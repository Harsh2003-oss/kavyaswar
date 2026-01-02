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
        console.error('Error deleting poem:', error);
        alert('Failed to delete poem');
      }
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const response = await poemAPI.search(searchQuery);
        setPoems(response.data.poems);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      fetchPoems();
    }
  };

  const copyShareLink = (shareableLink) => {
  if (!shareableLink) {
    alert('Shareable link not available for this poem');
    return;
  }
  
  const url = `${window.location.origin}/share/${shareableLink}`;
  
  navigator.clipboard.writeText(url).then(() => {
    alert('Share link copied to clipboard! 🎉\n\n' + url);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy link. Please try again.');
  });
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading poems...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Poems</h1>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-lg hidden sm:inline">Welcome, {user?.name}!</span>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">Profile</span>
                  <span className="text-sm">{showProfileMenu ? '▲' : '▼'}</span>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                    <button
                      onClick={() => {
                        navigate(`/profile/${user?._id}`);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                    >
                      <span>👁️</span>
                      <span className="font-semibold">View My Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/edit-profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                    >
                      <span>✏️</span>
                      <span className="font-semibold">Edit Profile</span>
                    </button>

                    <div className="border-t my-2"></div>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <span>🚪</span>
                      <span className="font-semibold">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search poems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 sm:w-80 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchPoems();
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={() => navigate('/create-poem')}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            + Create New Poem
          </button>
        </div>

        {/* Empty State */}
        {poems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">No poems yet</h2>
            <p className="text-gray-600 mb-8">Create your first poem to get started!</p>
            <button
              onClick={() => navigate('/create-poem')}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg text-lg font-semibold hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-1 transition-all"
            >
              Create Your First Poem
            </button>
          </div>
        ) : (
          /* Poems Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poems.map((poem) => (
              <div
                key={poem._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all p-6 flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-xl font-bold text-gray-800 flex-1">
                    {poem.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      poem.isPublic
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {poem.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>

                {/* Content Preview */}
                <div className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {poem.content.substring(0, 150)}
                  {poem.content.length > 150 && '...'}
                </div>

                {/* Tags */}
                {poem.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {poem.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>👁️ {poem.views || 0} views</span>
                  <span>❤️ {poem.likes || 0} likes</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/poem/${poem._id}`)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/edit-poem/${poem._id}`)}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  {poem.isPublic && (
                    <button
                      onClick={() => copyShareLink(poem.shareableLink)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Share
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(poem._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Date */}
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Created: {new Date(poem.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
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