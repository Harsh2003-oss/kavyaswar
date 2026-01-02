import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Poetry Words */}
        <div className="absolute top-20 left-10 text-white/10 text-6xl font-serif italic animate-float">
          Love
        </div>
        <div className="absolute top-40 right-20 text-white/10 text-5xl font-serif italic animate-float-delayed">
          Dreams
        </div>
        <div className="absolute bottom-32 left-20 text-white/10 text-7xl font-serif italic animate-float-slow">
          Soul
        </div>
        <div className="absolute bottom-20 right-32 text-white/10 text-4xl font-serif italic animate-float">
          Heart
        </div>
        
        {/* Floating Emojis */}
        <div className="absolute top-32 right-40 text-6xl opacity-20 animate-float">
          🪶
        </div>
        <div className="absolute bottom-40 left-32 text-5xl opacity-20 animate-float-delayed">
          📖
        </div>
        <div className="absolute top-1/2 left-20 text-5xl opacity-20 animate-float-slow">
          💜
        </div>
        <div className="absolute top-1/4 right-1/4 text-4xl opacity-20 animate-float">
          ⭐
        </div>
        <div className="absolute bottom-1/4 right-1/3 text-5xl opacity-20 animate-float-delayed">
          ✨
        </div>
        <div className="absolute top-2/3 right-1/4 text-4xl opacity-20 animate-float-slow">
          🌙
        </div>
        <div className="absolute top-1/3 left-1/3 text-3xl opacity-20 animate-float">
          ☁️
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20">
          {/* Header with Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-full text-5xl">
              🪶
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Kavyaswar
          </h1>
          <p className="text-center text-gray-600 italic mb-8">
            "Where words dance and hearts speak"
          </p>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:underline transition-all hover:text-pink-600">
          Register
              </Link>
            </p>
          </div>

          {/* Decorative Quote */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 italic text-sm">
              "Poetry is when an emotion has found its thought<br/>and the thought has found words."
            </p>
            <p className="text-center text-gray-400 text-xs mt-2">
              — Robert Frost
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse-delayed {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-pulse-delayed {
          animation: pulse-delayed 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Login;