import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { poemAPI } from '../../utils/api';

function CreatePoem() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isPublic: false,
    slideInterval: 3000,
    narrationSettings: {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoPlay: false,
    },
    backgroundMusic: {
      url: '',
      volume: 0.3,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleNarrationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      narrationSettings: {
        ...formData.narrationSettings,
        [name]: type === 'checkbox' ? checked : parseFloat(value),
      },
    });
  };

  const handleMusicUrlChange = (e) => {
    setFormData({
      ...formData,
      backgroundMusic: {
        ...formData.backgroundMusic,
        url: e.target.value
      }
    });
  };

  const handleMusicVolumeChange = (e) => {
    setFormData({
      ...formData,
      backgroundMusic: {
        ...formData.backgroundMusic,
        volume: parseFloat(e.target.value)
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      const poemData = {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        isPublic: formData.isPublic,
        slideInterval: parseInt(formData.slideInterval),
        narrationSettings: formData.narrationSettings,
        backgroundMusic: formData.backgroundMusic,
      };

      await poemAPI.create(poemData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating poem:', error);
      setError(error.response?.data?.message || 'Failed to create poem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create New Poem</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter poem title"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="10"
              placeholder="Write your poem here...&#10;Each line will be shown separately in slideshow mode"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              Tip: Each line will be displayed separately in slideshow mode
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="love, nature, peace (comma-separated)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-sm text-gray-500 mt-2">
              Separate tags with commas
            </p>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="isPublic" className="text-gray-700 font-semibold cursor-pointer">
              Make this poem public (allow sharing)
            </label>
          </div>

          {/* Background Music - SIMPLE VERSION */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🎵 Background Music (Optional)
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Music URL
              </label>
              <input
                type="url"
                value={formData.backgroundMusic.url}
                onChange={handleMusicUrlChange}
                placeholder="Paste music URL here (leave empty for no music)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Leave empty if you don't want background music
              </p>
            </div>

            {formData.backgroundMusic.url && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Music Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.backgroundMusic.volume}
                  onChange={handleMusicVolumeChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 text-center mt-1">
                  {Math.round(formData.backgroundMusic.volume * 100)}%
                </p>
              </div>
            )}
          </div>

          {/* Slideshow Settings */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Slideshow Settings
            </h3>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Slide Interval (milliseconds)
              </label>
              <input
                type="number"
                name="slideInterval"
                value={formData.slideInterval}
                onChange={handleChange}
                min="1000"
                max="10000"
                step="500"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-sm text-gray-500 mt-2">
                Time to display each 2 lines (3000ms = 3 seconds)
              </p>
            </div>
          </div>

          {/* Narration Settings */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              AI Narration Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Speech Rate
                </label>
                <input
                  type="range"
                  name="rate"
                  value={formData.narrationSettings.rate}
                  onChange={handleNarrationChange}
                  min="0.5"
                  max="2"
                  step="0.1"
                  className="w-full"
                />
                <p className="text-sm text-gray-600 text-center mt-1">
                  {formData.narrationSettings.rate}x
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Pitch
                </label>
                <input
                  type="range"
                  name="pitch"
                  value={formData.narrationSettings.pitch}
                  onChange={handleNarrationChange}
                  min="0.5"
                  max="2"
                  step="0.1"
                  className="w-full"
                />
                <p className="text-sm text-gray-600 text-center mt-1">
                  {formData.narrationSettings.pitch}x
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Volume
                </label>
                <input
                  type="range"
                  name="volume"
                  value={formData.narrationSettings.volume}
                  onChange={handleNarrationChange}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                />
                <p className="text-sm text-gray-600 text-center mt-1">
                  {Math.round(formData.narrationSettings.volume * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mt-6">
              <input
                type="checkbox"
                name="autoPlay"
                id="autoPlay"
                checked={formData.narrationSettings.autoPlay}
                onChange={handleNarrationChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="autoPlay" className="text-gray-700 font-semibold cursor-pointer">
                Auto-play narration when poem is opened
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all"
            >
              {loading ? 'Creating...' : 'Create Poem'}
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
  );
}

export default CreatePoem;