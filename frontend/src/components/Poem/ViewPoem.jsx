import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { poemAPI, commentAPI } from '../../utils/api';

function ViewPoem() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [poem, setPoem] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    fetchPoem();
    fetchComments();
  }, [id]);

  const fetchPoem = async () => {
    try {
      setLoading(true);
      const response = await poemAPI.getById(id);
      setPoem(response.data);
    } catch (error) {
      console.error('Error fetching poem:', error);
      setError('Failed to load poem');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getAll(id);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentAPI.delete(commentId);
      setComments(comments.filter(c => c._id !== commentId));
      alert('Comment deleted successfully! ✅');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleNarrate = () => {
    if (!poem) return;

    // If already speaking, stop it
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Get available voices
    let voices = speechSynthesis.getVoices();
    
    // If voices not loaded yet, wait and try again
    if (voices.length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        voices = speechSynthesis.getVoices();
        speakPoem(voices);
      });
    } else {
      speakPoem(voices);
    }
  };

  const speakPoem = (voices) => {
    // Filter Hindi voices
    const hindiVoices = voices.filter(voice => 
      voice.lang.includes('hi') || 
      voice.lang.includes('HI') ||
      voice.name.toLowerCase().includes('hindi')
    );

    console.log('Available voices:', voices.length);
    console.log('Hindi voices found:', hindiVoices.length);
    console.log('Hindi voices:', hindiVoices.map(v => `${v.name} (${v.lang})`));

    const utterance = new SpeechSynthesisUtterance(poem.content);
    
    // Try to use Hindi voice
    if (hindiVoices.length > 0) {
      // Prefer female or "natural" voices
      const preferredVoice = hindiVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('wavenet')
      ) || hindiVoices[0];
      
      utterance.voice = preferredVoice;
      utterance.lang = 'hi-IN'; // Hindi (India)
      console.log('Using voice:', preferredVoice.name);
    } else {
      console.warn('No Hindi voices available! Using default voice.');
      utterance.lang = 'hi-IN'; // Still set language even if no Hindi voice
    }

    // Apply narration settings
    utterance.rate = poem.narrationSettings?.rate || 0.85; // Slower for poetry
    utterance.pitch = poem.narrationSettings?.pitch || 1.0;
    utterance.volume = poem.narrationSettings?.volume || 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('Narration started');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('Narration ended');
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsSpeaking(false);
      alert('Failed to narrate. Try a different browser or enable Hindi voices in your system.');
    };

    speechSynthesis.speak(utterance);
  };

  const handleStopNarration = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const copyShareLink = () => {
    if (!poem.isPublic) {
      alert('This poem is private. Make it public first to share!');
      return;
    }
    const url = `${window.location.origin}/share/${poem.shareableLink}`;
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
        <div className="text-xl text-gray-600">Loading poem...</div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Poem not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit-poem/${id}`)}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
            >
              Edit
            </button>
            {poem.isPublic && (
              <button
                onClick={copyShareLink}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
              >
                📤 Share
              </button>
            )}
          </div>
        </div>

        {/* Poem Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Title and Status */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold text-gray-800">{poem.title}</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                poem.isPublic
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {poem.isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          {/* Content */}
          <div className="mb-8">
            <pre className="whitespace-pre-wrap font-serif text-lg text-gray-700 leading-relaxed">
              {poem.content}
            </pre>
          </div>

          {/* Tags */}
          {poem.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {poem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 text-gray-600 mb-8 pb-8 border-b">
            <span className="text-lg">👁️ {poem.views || 0} views</span>
            <span className="text-lg">❤️ {poem.likes || 0} likes</span>
            <span className="text-lg">💬 {comments.length} comments</span>
            <span className="text-lg">
              📅 {new Date(poem.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => navigate(`/slideshow/${id}`)}
              className="py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transform hover:-translate-y-0.5 transition-all text-lg"
            >
              📽️ View Slideshow
            </button>
            <button
              onClick={handleNarrate}
              disabled={isSpeaking}
              className={`py-4 rounded-lg font-semibold transform hover:-translate-y-0.5 transition-all text-lg ${
                isSpeaking
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
              }`}
            >
              {isSpeaking ? '🔇 Stop Narration' : '🎤 Play Narration'}
            </button>
          </div>

          {/* Narration Info */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">🎙️ Narration Settings:</p>
            <p>
              Speed: {poem.narrationSettings?.rate || 0.85}x | 
              Pitch: {poem.narrationSettings?.pitch || 1.0}x | 
              Volume: {Math.round((poem.narrationSettings?.volume || 1.0) * 100)}%
            </p>
            {!isSpeaking && (
              <p className="text-xs mt-2 text-gray-500">
                💡 Tip: For better Hindi narration, install Hindi language pack in your system settings
              </p>
            )}
          </div>
        </div>

        {/* Comments Section - Only show if poem is public */}
        {poem.isPublic && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💬</span>
                <h2 className="text-2xl font-bold text-gray-800">
                  Comments ({comments.length})
                </h2>
              </div>
              {comments.length > 0 && (
                <span className="text-sm text-gray-500">
                  As the author, you can delete inappropriate comments
                </span>
              )}
            </div>

            {comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="text-6xl mb-4">💭</div>
                <p className="text-xl text-gray-600 font-semibold mb-2">No comments yet</p>
                <p className="text-gray-500">Share your poem to start receiving comments!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-purple-100 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center text-white text-xl font-bold">
                            {comment.guestName.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <p className="font-bold text-gray-800 text-lg">
                              {comment.guestName}
                            </p>
                            {comment.guestEmail && (
                              <>
                                <span className="text-sm text-gray-400">•</span>
                                <p className="text-sm text-gray-600">
                                  {comment.guestEmail}
                                </p>
                              </>
                            )}
                            <span className="text-sm text-gray-400">•</span>
                            <p className="text-sm text-gray-600">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="flex-shrink-0 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        title="Delete this comment"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Private Poem Notice */}
        {!poem.isPublic && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              This poem is private
            </p>
            <p className="text-gray-600">
              Make it public to receive comments from readers. Edit the poem to change its visibility.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewPoem;