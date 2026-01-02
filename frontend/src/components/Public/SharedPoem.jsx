import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poemAPI, commentAPI } from '../../utils/api';

function SharedPoem() {
  const { link } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchPoem();
  }, [link]);

  useEffect(() => {
    const disable = e => e.preventDefault();
    document.addEventListener('copy', disable);
    document.addEventListener('cut', disable);
    document.addEventListener('contextmenu', disable);
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('copy', disable);
      document.removeEventListener('cut', disable);
      document.removeEventListener('contextmenu', disable);
      document.body.style.userSelect = 'auto';
    };
  }, []);

  const fetchPoem = async () => {
    try {
      const res = await poemAPI.getByLink(link);
      setPoem(res.data);

      const viewedKey = `viewed_${res.data._id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        await poemAPI.incrementViews(res.data._id);
        sessionStorage.setItem(viewedKey, 'true');
        res.data.views = (res.data.views || 0) + 1;
      }

      setHasLiked(!!localStorage.getItem(`liked_${res.data._id}`));
      fetchComments(res.data._id);
    } catch {
      alert('Poem not found or private');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (id) => {
    const res = await commentAPI.getAll(id);
    setComments(res.data.comments);
  };

  const handleLike = async () => {
    if (hasLiked) return;
    await poemAPI.like(poem._id);
    localStorage.setItem(`liked_${poem._id}`, 'true');
    setPoem({ ...poem, likes: poem.likes + 1 });
    setHasLiked(true);
  };

  const handleNarrate = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(poem.content);
    u.lang = 'hi-IN';
    u.rate = poem.narrationSettings?.rate || 0.85;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(u);
  };

  const handleMusic = () => {
    if (!poem.backgroundMusic?.url) return;
    if (!audio) {
      const a = new Audio(poem.backgroundMusic.url);
      a.loop = true;
      a.volume = 0.3;
      a.play();
      setAudio(a);
      setIsPlaying(true);
    } else {
      isPlaying ? audio.pause() : audio.play();
      setIsPlaying(!isPlaying);
    }
  };

  const submitComment = async e => {
    e.preventDefault();
    setSubmitting(true);
    await commentAPI.add(poem._id, { guestName, guestEmail, comment });
    setGuestName('');
    setGuestEmail('');
    setComment('');
    fetchComments(poem._id);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
        <div className="text-2xl font-semibold animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!poem) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">

      <header className="text-center py-14 bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-xl">
        <h1 className="text-5xl font-extrabold mb-2">{poem.title}</h1>
        <p className="text-purple-200">
          By {poem.userId?.name || 'Anonymous'} • {new Date(poem.createdAt).toDateString()}
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-10">
          <pre className="whitespace-pre-wrap font-serif text-xl leading-relaxed text-gray-800 mb-10">
            {poem.content}
          </pre>

          <div className="flex flex-wrap justify-center gap-10 border-y py-6 mb-8">
            <div className="text-center"><div className="text-3xl">👁️</div><b>{poem.views}</b></div>
            <div className="text-center"><div className="text-3xl">❤️</div><b>{poem.likes}</b></div>
            <div className="text-center"><div className="text-3xl">💬</div><b>{comments.length}</b></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={handleLike} disabled={hasLiked}
              className={`py-4 rounded-xl font-bold text-white transition ${
                hasLiked ? 'bg-gray-400' : 'bg-gradient-to-r from-pink-500 to-red-500 hover:scale-105'
              }`}>
              ❤️ {hasLiked ? 'Liked' : 'Like'}
            </button>

            <button onClick={handleNarrate}
              className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105">
              {isSpeaking ? 'Stop' : 'Listen'}
            </button>

            {poem.backgroundMusic?.url && (
              <button onClick={handleMusic}
                className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105">
                {isPlaying ? 'Pause Music' : 'Play Music'}
              </button>
            )}

            <button onClick={() => navigate(`/profile/${poem.userId._id}`)}
              className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105">
              Author
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold mb-6">Comments</h2>

          <form onSubmit={submitComment} className="mb-8 grid gap-4">
            <input value={guestName} onChange={e => setGuestName(e.target.value)}
              placeholder="Your name" required
              className="p-3 rounded-lg border" />
            <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
              placeholder="Email (optional)" className="p-3 rounded-lg border" />
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Your comment…" rows="4" required
              className="p-3 rounded-lg border" />
            <button disabled={submitting}
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105">
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </form>

          <div className="space-y-4">
            {comments.map(c => (
              <div key={c._id}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 shadow">
                <b>{c.guestName}</b>
                <p className="text-sm text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
                <p className="mt-2">{c.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center py-6 text-gray-600 border-t bg-white">
        🔒 Protected content · Kavyaswar
      </footer>
    </div>
  );
}

export default SharedPoem;
