import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poemAPI, commentAPI } from '../../utils/api';

function SharedPoem() {
  const { shareLink } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
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

  const fetchPoem = async () => {
    try {
      const response = await poemAPI.getByLink(shareLink);
      setPoem(response.data);
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
    try {
      await poemAPI.like(poem._id);
      setPoem({ ...poem, likes: poem.likes + 1 });
    } catch (error) {
      console.error('Error liking poem:', error);
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
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Poem not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{poem.title}</h1>
          <p className="text-purple-200">
            By {poem.userId?.name || 'Anonymous'} • {new Date(poem.createdAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Poem Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <pre className="whitespace-pre-wrap font-serif text-lg text-gray-700 leading-relaxed mb-6">
            {poem.content}
          </pre>

          {/* Tags */}
          {poem.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {poem.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 mb-6 pb-6 border-b">
            <span className="text-gray-600">👁️ {poem.views} views</span>
            <button onClick={handleLike} className="text-gray-600 hover:text-red-500 transition-colors">
              ❤️ {poem.likes} likes
            </button>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleNarrate}
              className={`py-3 rounded-lg font-semibold transition-all ${
                isSpeaking ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isSpeaking ? '🔇 Stop' : '🎤 Narrate'}
            </button>

            {poem.backgroundMusic?.url && (
              <button
                onClick={handlePlayMusic}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  isPlaying ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isPlaying ? '⏸️ Pause Music' : '🎵 Play Music'}
              </button>
            )}

            <button
              onClick={() => navigate(`/profile/${poem.userId._id}`)}
              className="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
            >
              👤 View Author Profile
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Leave a Comment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
              <input
                type="email"
                placeholder="Your Email (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <textarea
              placeholder="Write your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500 mb-4"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{c.guestName}</p>
                      <p className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">{c.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedPoem;