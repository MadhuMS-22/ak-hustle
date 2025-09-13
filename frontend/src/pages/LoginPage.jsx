import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    teamName: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setMessage({ type: 'info', text: 'Logging in...' });

        const response = await authService.login({
          teamName: formData.teamName,
          password: formData.password
        });

        if (response.success) {
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          // Use the login method from AuthContext with token
          login(response.data.team, response.data.token);
          // Redirect to team page after successful login
          setTimeout(() => {
            navigate('/team');
          }, 1500);
        }
      } catch (error) {
        console.error('Login error:', error);
        setMessage({
          type: 'error',
          text: error.message || 'Login failed. Please check your credentials.'
        });
      }
    } else {
      setMessage({ type: 'error', text: 'Please check your credentials.' });
    }
  };

  const renderIcon = (svgPath, className) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={svgPath} />
    </svg>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pt-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                Team Login
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Sign in to your team account to start the competition
              </p>
            </div>

            <div className="glass-dark rounded-3xl p-8 shadow-2xl">
              {message.text && (
                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-500 bg-opacity-20 text-green-200 border border-green-400 border-opacity-30' :
                  message.type === 'error' ? 'bg-red-500 bg-opacity-20 text-red-200 border border-red-400 border-opacity-30' :
                    message.type === 'info' ? 'bg-blue-500 bg-opacity-20 text-blue-200 border border-blue-400 border-opacity-30' :
                      'bg-gray-500 bg-opacity-20 text-gray-200 border border-gray-400 border-opacity-30'
                  }`}>
                  <div className="flex items-center">
                    {message.type === 'success' && (
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {message.type === 'error' && (
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {message.type === 'info' && (
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {message.text}
                  </div>
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-white text-base font-medium mb-2">
                    <div className="flex items-center">
                      {renderIcon("M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "w-4 h-4 mr-2")}
                      Team Name
                    </div>
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 glass border border-purple-400/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400/50 transition-all duration-300"
                    placeholder="Enter your team name"
                  />
                  {errors.teamName && <p className="text-red-400 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.teamName}
                  </p>}
                </div>

                <div>
                  <label className="block text-white text-base font-medium mb-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 pr-12 glass border border-purple-400/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400/50 transition-all duration-300"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-purple-500/20"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.68 9.68 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.51 3.15M12 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm7 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.password}
                  </p>}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-500 hover:scale-105 transform shadow-2xl glow-purple"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </div>
                </button>

                <div className="text-center pt-2">
                  <p className="text-gray-300">
                    Don't have an account?{' '}
                    <button onClick={() => navigate('/register')} className="text-purple-400 hover:text-purple-300 transition-colors font-semibold hover:underline">
                      Register Here
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
