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
      const res = await poemAPI.getById(id);
      setPoem(res.data);
    } catch {
      setError('Failed to load poem');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await commentAPI.getAll(id);
      setComments(res.data.comments);
    } catch {}
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm('Delete this comment?')) return;
    await commentAPI.delete(cid);
    setComments(prev => prev.filter(c => c._id !== cid));
  };

  const handleNarrate = () => {
    if (!poem) return;
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(poem.content);
    utterance.lang = 'hi-IN';
    utterance.rate = poem.narrationSettings?.rate || 0.85;
    utterance.pitch = poem.narrationSettings?.pitch || 1;
    utterance.volume = poem.narrationSettings?.volume || 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const copyShareLink = () => {
    if (!poem.isPublic) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/share/${poem.shareableLink}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
        <div className="text-2xl font-semibold animate-pulse">Loading poem…</div>
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/dashboard')}>Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-10">
      <div className="max-w-4xl mx-auto px-4">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-purple-700 font-semibold hover:underline"
          >
            ← Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit-poem/${id}`)}
              className="px-5 py-2 rounded-full bg-yellow-400 text-white font-semibold hover:scale-105 transition"
            >
              Edit
            </button>
            {poem.isPublic && (
              <button
                onClick={copyShareLink}
                className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold hover:scale-105 transition"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Poem Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-10 mb-10">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-5xl font-extrabold text-gray-800">
              {poem.title}
            </h1>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              poem.isPublic ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
            }`}>
              {poem.isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          <pre className="font-serif text-xl text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">
            {poem.content}
          </pre>

          {poem.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {poem.tags.map((t, i) => (
                <span key={i} className="px-4 py-1 rounded-full bg-purple-200 text-purple-800 text-sm font-semibold">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-6 text-gray-600 text-lg mb-8 border-t pt-6">
            <span>👁️ {poem.views || 0}</span>
            <span>❤️ {poem.likes || 0}</span>
            <span>💬 {comments.length}</span>
            <span>📅 {new Date(poem.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/slideshow/${id}`)}
              className="py-4 rounded-xl bg-blue-500 text-white font-bold hover:scale-105 transition"
            >
              View Slideshow
            </button>
            <button
              onClick={handleNarrate}
              className={`py-4 rounded-xl font-bold transition ${
                isSpeaking
                  ? 'bg-red-500 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105'
              }`}
            >
              {isSpeaking ? 'Stop Narration' : 'Play Narration'}
            </button>
          </div>
        </div>

        {/* Comments */}
        {poem.isPublic && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-10">
            <h2 className="text-3xl font-bold mb-6">Comments</h2>

            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No comments yet
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(c => (
                  <div
                    key={c._id}
                    className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 shadow"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold text-lg">{c.guestName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-red-600 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-3 text-gray-700">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewPoem;
