import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { poemAPI } from '../../utils/api';

function Slideshow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    fetchPoem();
  }, [id]);

  useEffect(() => {
    if (poem && isPlaying && !isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          const totalSlides = Math.ceil(poem.lines.length / 2);
          if (prev < totalSlides - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, poem.slideInterval || 3000);

      return () => clearInterval(interval);
    }
  }, [poem, isPlaying, isPaused]);

  const fetchPoem = async () => {
    try {
      setLoading(true);
      const response = await poemAPI.getById(id);
      setPoem(response.data);
      
      if (response.data.narrationSettings?.autoPlay) {
        handleNarrate(response.data);
      }
    } catch (error) {
      console.error('Error fetching poem:', error);
      alert('Failed to load poem');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleNarrate = (poemData = poem) => {
    if (!poemData) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let voices = speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        voices = speechSynthesis.getVoices();
        speakWithVoice(voices, poemData);
      });
    } else {
      speakWithVoice(voices, poemData);
    }
  };

  const speakWithVoice = (voices, poemData) => {
    const hindiVoices = voices.filter(voice => 
      voice.lang.includes('hi') || 
      voice.lang.includes('HI') ||
      voice.name.toLowerCase().includes('hindi')
    );

    console.log('Available Hindi voices:', hindiVoices);

    const utterance = new SpeechSynthesisUtterance(poemData.content);
    
    if (hindiVoices.length > 0) {
      const preferredVoice = hindiVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('wavenet')
      ) || hindiVoices[0];
      
      utterance.voice = preferredVoice;
      utterance.lang = 'hi-IN';
      console.log('Using voice:', preferredVoice.name);
    } else {
      console.warn('No Hindi voices available');
      utterance.lang = 'hi-IN';
    }

    utterance.rate = poemData.narrationSettings?.rate || 0.85;
    utterance.pitch = poemData.narrationSettings?.pitch || 1.0;
    utterance.volume = poemData.narrationSettings?.volume || 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSlide(0);
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleNext = () => {
    const totalSlides = Math.ceil(poem.lines.length / 2);
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleExit = () => {
    speechSynthesis.cancel();
    navigate(`/poem/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-2xl">Loading slideshow...</div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-2xl">Poem not found</div>
      </div>
    );
  }

  const totalSlides = Math.ceil(poem.lines.length / 2);
  const startIndex = currentSlide * 2;
  const currentLines = poem.lines.slice(startIndex, startIndex + 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white flex flex-col">
      <div className="bg-black/30 backdrop-blur-sm p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{poem.title}</h1>
            <p className="text-sm text-gray-300 mt-1">
              Slide {currentSlide + 1} of {totalSlides}
            </p>
          </div>
          <button
            onClick={handleExit}
            className="px-6 py-2 bg-red-500/80 hover:bg-red-600 rounded-lg font-semibold transition-colors"
          >
            Exit Slideshow
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center">
          <div className="bg-black/20 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/10">
            <div className="space-y-6 min-h-[200px] flex flex-col justify-center">
              {currentLines.map((line, index) => (
                <p
                  key={index}
                  className="text-4xl md:text-5xl font-serif leading-relaxed animate-fade-in"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  {line}
                </p>
              ))}
            </div>

            <div className="mt-12 mb-8">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentSlide === 0}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
              >
                ⏮️ Previous
              </button>

              <button
                onClick={handlePlayPause}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
              >
                {!isPlaying ? '▶️ Play' : isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>

              <button
                onClick={handleStop}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all"
              >
                ⏹️ Stop
              </button>

              <button
                onClick={handleNext}
                disabled={currentSlide === totalSlides - 1}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg font-semibold transition-all"
              >
                Next ⏭️
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <button
                onClick={() => handleNarrate()}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isSpeaking ? '🔇 Stop Narration' : '🎤 Play Narration'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/30 backdrop-blur-sm p-4 text-center text-sm text-gray-300">
        <p>Press Previous/Next to navigate • Click Play to auto-advance slides</p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default Slideshow;