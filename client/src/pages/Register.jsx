import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { authService } from '../services';
import { Moon, Sun } from 'lucide-react';
import Logo from '../components/Logo';
import AnimatedBackground from '../components/AnimatedBackground';
import CursorFollower from '../components/CursorFollower';
import TextScramble from '../components/TextScramble';
import gsap from 'gsap';

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const themeButtonRef = useRef(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (themeButtonRef.current) {
      gsap.fromTo(themeButtonRef.current,
        { scale: 0, rotation: -180 },
 { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, []);

  const handleThemeToggle = () => {
    if (themeButtonRef.current) {
      gsap.to(themeButtonRef.current, {
        rotation: '+=360',
        duration: 0.5,
        ease: 'power2.out',
      });
    }
    toggleTheme();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...userData } = formData;
      const data = await authService.register(userData);
      login(data, data.token);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'} animate-gradient flex items-center justify-center p-4 transition-colors duration-300`}>
      <CursorFollower variant="blob" />
      <AnimatedBackground isDarkMode={isDarkMode} />
      
      {/* Theme Toggle Button */}
      <button
        ref={themeButtonRef}
        onClick={handleThemeToggle}
        className={`fixed top-4 right-4 p-3 rounded-lg transition-all duration-300 z-10 ${
          isDarkMode 
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 hover:scale-110' 
            : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'
        } backdrop-blur-sm`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scale-in ${isDarkMode ? 'hover:shadow-indigo-900/50' : 'hover:shadow-indigo-500/50'} transition-all duration-300`}>
        <div className="mb-8">
          <Logo size="large" />
        </div>

        <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'} mb-6 text-center animate-fade-in stagger-1`}>
          <TextScramble text="Create Account" />
        </h2>

        {error && (
          <div className={`${isDarkMode ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg mb-4 animate-shake`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-slide-in-bottom stagger-2">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              className={`w-full px-4 py-3 border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500'
              } rounded-lg focus:ring-2 focus:border-transparent transition hover:border-indigo-300`}
              placeholder="johndoe"
            />
          </div>

          <div className="animate-slide-in-bottom stagger-3">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500'
              } rounded-lg focus:ring-2 focus:border-transparent transition hover:border-indigo-300`}
              placeholder="your@email.com"
            />
          </div>

          <div className="animate-slide-in-bottom stagger-4">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500'
              } rounded-lg focus:ring-2 focus:border-transparent transition hover:border-indigo-300`}
              placeholder="••••••••"
            />
          </div>

          <div className="animate-slide-in-bottom stagger-5">
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-indigo-500'
              } rounded-lg focus:ring-2 focus:border-transparent transition hover:border-indigo-300`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-in-bottom"
            style={{ animationDelay: '0.6s' }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className={`mt-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} animate-fade-in`} style={{ animationDelay: '0.7s' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
