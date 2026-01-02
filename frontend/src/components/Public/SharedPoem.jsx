import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poemAPI, commentAPI } from '../../utils/api';

function SharedPoem() {
  const  { link} = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const shareLink = link;
  // Comment form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Background music
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchPoem();
  }, [shareLink]);

  useEffect(() => {
    // Add copy protection
    const preventCopy = (e) => {
      e.preventDefault();
      return false;
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const preventKeyboard = (e) => {
      // Prevent Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+U, F12, Ctrl+Shift+I, Ctrl+Shift+J
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
        (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Apply protections
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboard);

    // Disable text selection via CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.msUserSelect = 'none';

    // Cleanup
    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboard);
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
      document.body.style.msUserSelect = 'auto';
    };
  }, []);

  const fetchPoem = async () => {
    try {
      const response = await poemAPI.getByLink(shareLink);
      setPoem(response.data);
      
      // Auto-increment views (only once per session)
      const viewedKey = `viewed_${response.data._id}`;
      const hasViewed = sessionStorage.getItem(viewedKey);
      
      if (!hasViewed) {
        await poemAPI.incrementViews(response.data._id);
        sessionStorage.setItem(viewedKey, 'true');
        // Update local state
        response.data.views = (response.data.views || 0) + 1;
      }

      // Check if user has already liked
      const likedKey = `liked_${response.data._id}`;
      const hasLikedBefore = localStorage.getItem(likedKey);
      setHasLiked(!!hasLikedBefore);

      fetchComments(response.data._id);
    } catch (error) {
      console.error('Error:', error);
      alert('Poem not found or is private');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (poemId) => {
    try {
      const response = await commentAPI.getAll(poemId);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (hasLiked) {
      alert('You have already liked this poem!');
      return;
    }

    try {
      await poemAPI.like(poem._id);
      
      // Save to localStorage
      const likedKey = `liked_${poem._id}`;
      localStorage.setItem(likedKey, 'true');
      
      setPoem({ ...poem, likes: poem.likes + 1 });
      setHasLiked(true);
    } catch (error) {
      console.error('Error liking poem:', error);
      alert('Failed to like poem');
    }
  };

  const handleNarrate = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let voices = speechSynthesis.getVoices();
    
    const speakPoem = () => {
      const hindiVoices = voices.filter(v => 
        v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
      );

      const utterance = new SpeechSynthesisUtterance(poem.content);
      
      if (hindiVoices.length > 0) {
        utterance.voice = hindiVoices[0];
        utterance.lang = 'hi-IN';
      }

      utterance.rate = poem.narrationSettings?.rate || 0.85;
      utterance.pitch = poem.narrationSettings?.pitch || 1.0;
      utterance.volume = poem.narrationSettings?.volume || 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    };

    if (voices.length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        voices = speechSynthesis.getVoices();
        speakPoem();
      });
    } else {
      speakPoem();
    }
  };

  const handlePlayMusic = () => {
    if (!poem.backgroundMusic?.url) return;

    if (!audio) {
      const newAudio = new Audio(poem.backgroundMusic.url);
      newAudio.volume = poem.backgroundMusic.volume || 0.3;
      newAudio.loop = true;
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!guestName.trim() || !comment.trim()) {
      alert('Please enter your name and comment');
      return;
    }

    setSubmitting(true);
    try {
      await commentAPI.add(poem._id, {
        guestName,
        guestEmail,
        comment,
      });
      
      setGuestName('');
      setGuestEmail('');
      setComment('');
      fetchComments(poem._id);
      alert('Comment posted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading poem...</div>
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📜</div>
          <div className="text-2xl font-bold text-gray-800 mb-2">Poem not found</div>
          <div className="text-gray-600">This poem may be private or no longer available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Copy Protection Notice */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
        🔒 This content is protected. Copying is disabled.
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 shadow-xl">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
              <span className="text-5xl">📝</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">{poem.title}</h1>
          <div className="flex flex-wrap justify-center items-center gap-4 text-purple-200">
            <span className="flex items-center gap-2">
              <span>👤</span>
              <span>By {poem.userId?.name || 'Anonymous'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <span>📅</span>
              <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Poem Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          {/* Poem Text - Non-selectable */}
          <div 
            className="mb-8"
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            <pre className="whitespace-pre-wrap font-serif text-lg md:text-xl text-gray-800 leading-relaxed">
              {poem.content}
            </pre>
          </div>

          {/* Tags */}
          {poem.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b-2 border-gray-100">
              {poem.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8 pb-8 border-b-2 border-gray-100">
            <div className="text-center">
              <div className="text-3xl mb-1">👁️</div>
              <div className="text-2xl font-bold text-gray-800">{poem.views || 0}</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">❤️</div>
              <div className="text-2xl font-bold text-gray-800">{poem.likes || 0}</div>
              <div className="text-sm text-gray-600">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">💬</div>
              <div className="text-2xl font-bold text-gray-800">{comments.length}</div>
              <div className="text-sm text-gray-600">Comments</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105 ${
                hasLiked 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg'
              }`}
            >
              {hasLiked ? '❤️ Liked!' : '❤️ Like This Poem'}
            </button>

            <button
              onClick={handleNarrate}
              className={`py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                isSpeaking 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
              }`}
            >
              {isSpeaking ? '🔇 Stop Narration' : '🎤 Listen'}
            </button>

            {poem.backgroundMusic?.url && (
              <button
                onClick={handlePlayMusic}
                className={`py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                  isPlaying 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
                }`}
              >
                {isPlaying ? '⏸️ Pause Music' : '🎵 Play Music'}
              </button>
            )}

            <button
              onClick={() => navigate(`/profile/${poem.userId._id}`)}
              className="py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              👤 View Author
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">💬</span>
            <h2 className="text-3xl font-bold text-gray-800">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-10 p-6 md:p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100">
            <h3 className="text-xl font-bold mb-6 text-gray-800">💭 Share Your Thoughts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
              <input
                type="email"
                placeholder="Your Email (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <textarea
              placeholder="Write your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 mb-4 transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg"
            >
              {submitting ? '✍️ Posting...' : '📤 Post Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-6xl mb-4">💭</div>
                <p className="text-xl text-gray-600 font-semibold mb-2">No comments yet</p>
                <p className="text-gray-500">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-purple-100 rounded-xl hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-xl font-bold">
                        {c.guestName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <p className="font-bold text-gray-800 text-lg">{c.guestName}</p>
                        <span className="text-sm text-gray-500">•</span>
                        <p className="text-sm text-gray-600">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{c.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">🔒 This content is protected by Kavyaswar</p>
          <p className="text-sm">Copying, screenshots, and unauthorized distribution are prohibited</p>
        </div>
      </footer>
    </div>
  );
}

export default SharedPoem;