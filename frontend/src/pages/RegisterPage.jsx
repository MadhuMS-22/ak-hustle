import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import authService from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    teamName: '',
    member1Email: '',
    member1Name: '',
    member2Email: '',
    member2Name: '',
    leader: 'member1', // 'member1' or 'member2'
    leaderPhone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Team name validation
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    } else if (formData.teamName.length < 3) {
      newErrors.teamName = 'Team name must be at least 3 characters';
    }

    // Member 1 validation
    if (!formData.member1Name.trim()) {
      newErrors.member1Name = 'Member 1 name is required';
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(formData.member1Name)) {
      newErrors.member1Name = 'Member 1 name can only contain letters, numbers, spaces, hyphens, underscores, and dots';
    }
    if (!formData.member1Email.trim()) {
      newErrors.member1Email = 'Member 1 email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.member1Email)) {
      newErrors.member1Email = 'Invalid email format';
    }

    // Member 2 validation
    if (!formData.member2Name.trim()) {
      newErrors.member2Name = 'Member 2 name is required';
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(formData.member2Name)) {
      newErrors.member2Name = 'Member 2 name can only contain letters, numbers, spaces, hyphens, underscores, and dots';
    }
    if (!formData.member2Email.trim()) {
      newErrors.member2Email = 'Member 2 email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.member2Email)) {
      newErrors.member2Email = 'Invalid email format';
    }

    // Check for duplicate emails
    if (formData.member1Email && formData.member2Email &&
      formData.member1Email === formData.member2Email) {
      newErrors.member2Email = 'Member emails must be different';
    }

    // Leader phone validation
    if (!formData.leaderPhone.trim()) {
      newErrors.leaderPhone = 'Leader phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.leaderPhone.replace(/\s/g, ''))) {
      newErrors.leaderPhone = 'Invalid phone number format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setMessage({ type: 'info', text: 'Registering team...' });

        const response = await authService.register({
          teamName: formData.teamName,
          member1Name: formData.member1Name,
          member1Email: formData.member1Email,
          member2Name: formData.member2Name,
          member2Email: formData.member2Email,
          leader: formData.leader,
          leaderPhone: formData.leaderPhone,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });

        if (response.success) {
          setMessage({ type: 'success', text: 'Team registered successfully! Redirecting to login...' });
          // Store team data in localStorage for easy access
          localStorage.setItem('hustle_team', JSON.stringify(response.data.team));
          // Redirect to login page after successful registration
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Registration error:', error);
        console.error('Full error details:', error);

        // Extract more detailed error information
        let errorMessage = error.message || 'Registration failed. Please try again.';

        // If it's a validation error, show more details
        if (error.message && error.message.includes('Details:')) {
          errorMessage = error.message;
        }

        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
    } else {
      setMessage({ type: 'error', text: 'Please correct the errors in the form.' });
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
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                Team Registration
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Register your team for the technical competition
              </p>
            </div>

            {/* Registration Form */}
            <div className="glass-dark rounded-3xl p-8 shadow-2xl">
              {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500 bg-opacity-20 text-green-200 border border-green-400 border-opacity-30' :
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
                    <span className="font-medium">{message.text}</span>
                  </div>
                </div>
              )}
              <div className="space-y-6">
                {/* Team Name */}
                <div>
                  <label className="block text-white text-base font-medium mb-2">
                    <div className="flex items-center">
                      {renderIcon("M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm12 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "w-4 h-4 mr-2")}
                      Team Name
                    </div>
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 glass border border-purple-400/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                    placeholder="Enter your team name"
                  />
                  {errors.teamName && <p className="text-red-400 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.teamName}
                  </p>}
                </div>

                {/* Team Members Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-purple-400 border-opacity-30 pb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Team Members
                  </h3>

                  {/* Member 1 */}
                  <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
                    <h4 className="text-base font-semibold text-purple-300 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                        <span className="text-purple-300 font-bold text-sm">1</span>
                      </div>
                      Member 1
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          <div className="flex items-center">
                            {renderIcon("M1 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 4v-2a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1zm-4-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "w-4 h-4 mr-2")}
                            Full Name
                          </div>
                        </label>
                        <input
                          type="text"
                          name="member1Name"
                          value={formData.member1Name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 glass border border-purple-400/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                          placeholder="Enter member 1 name"
                        />
                        {errors.member1Name && <p className="text-red-400 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.member1Name}
                        </p>}
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          <div className="flex items-center">
                            {renderIcon("M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6L12 13L2 6", "w-4 h-4 mr-2")}
                            Email Address
                          </div>
                        </label>
                        <input
                          type="email"
                          name="member1Email"
                          value={formData.member1Email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 glass border border-purple-400/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                          placeholder="member1@example.com"
                        />
                        {errors.member1Email && <p className="text-red-400 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.member1Email}
                        </p>}
                      </div>
                    </div>
                  </div>

                  {/* Member 2 */}
                  <div className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
                    <h4 className="text-base font-semibold text-purple-300 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                        <span className="text-purple-300 font-bold text-sm">2</span>
                      </div>
                      Member 2
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          <div className="flex items-center">
                            {renderIcon("M1 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 4v-2a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1zm-4-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "w-4 h-4 mr-2")}
                            Full Name
                          </div>
                        </label>
                        <input
                          type="text"
                          name="member2Name"
                          value={formData.member2Name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 glass border border-purple-400/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                          placeholder="Enter member 2 name"
                        />
                        {errors.member2Name && <p className="text-red-400 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.member2Name}
                        </p>}
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          <div className="flex items-center">
                            {renderIcon("M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6L12 13L2 6", "w-4 h-4 mr-2")}
                            Email Address
                          </div>
                        </label>
                        <input
                          type="email"
                          name="member2Email"
                          value={formData.member2Email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 glass border border-purple-400/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md"
                          placeholder="member2@example.com"
                        />
                        {errors.member2Email && <p className="text-red-400 text-sm mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.member2Email}
                        </p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leader Selection */}
                <div className="bg-white bg-opacity-5 rounded-2xl p-6 border border-white border-opacity-10">
                  <label className="block text-white text-xl font-bold mb-6">
                    <div className="flex items-center">
                      {renderIcon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 14s1.5 2 4 2 4-2 4-2M15 9h.01M9 9h.01", "w-6 h-6 mr-3")}
                      Choose Team Leader
                    </div>
                  </label>
                  <div className="grid md:grid-cols-2 gap-6">
                    <label className={`flex items-center p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${formData.leader === 'member1'
                      ? 'bg-purple-500 bg-opacity-20 border-purple-400 shadow-lg'
                      : 'bg-white bg-opacity-5 border-white border-opacity-20 hover:bg-opacity-10'
                      }`}>
                      <input
                        type="radio"
                        name="leader"
                        value="member1"
                        checked={formData.leader === 'member1'}
                        onChange={handleInputChange}
                        className="mr-4 w-5 h-5 text-purple-500 focus:ring-purple-400"
                      />
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">
                          {formData.member1Name || 'Member 1'}
                        </div>
                        <div className="text-gray-300 text-base">
                          {formData.member1Email || 'member1@example.com'}
                        </div>
                      </div>
                      {formData.leader === 'member1' && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label className={`flex items-center p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${formData.leader === 'member2'
                      ? 'bg-purple-500 bg-opacity-20 border-purple-400 shadow-lg'
                      : 'bg-white bg-opacity-5 border-white border-opacity-20 hover:bg-opacity-10'
                      }`}>
                      <input
                        type="radio"
                        name="leader"
                        value="member2"
                        checked={formData.leader === 'member2'}
                        onChange={handleInputChange}
                        className="mr-4 w-5 h-5 text-purple-500 focus:ring-purple-400"
                      />
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">
                          {formData.member2Name || 'Member 2'}
                        </div>
                        <div className="text-gray-300 text-base">
                          {formData.member2Email || 'member2@example.com'}
                        </div>
                      </div>
                      {formData.leader === 'member2' && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Leader Phone */}
                <div className="bg-white bg-opacity-5 rounded-2xl p-6 border border-white border-opacity-10">
                  <label className="block text-white text-lg font-semibold mb-3">
                    <div className="flex items-center">
                      {renderIcon("M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", "w-5 h-5 mr-3")}
                      Team Leader Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="leaderPhone"
                    value={formData.leaderPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 glass border border-purple-400/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md text-lg"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.leaderPhone && <p className="text-red-400 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.leaderPhone}
                  </p>}
                </div>

                {/* Password Section */}
                <div className="bg-white bg-opacity-5 rounded-2xl p-6 border border-white border-opacity-10">
                  <h3 className="text-2xl font-bold text-white border-b-2 border-purple-400 border-opacity-30 pb-3 mb-8 flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Account Security
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white text-base font-semibold mb-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className="w-full px-4 py-3 pr-14 glass border border-purple-400/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md text-lg"
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.68 9.68 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.51 3.15M12 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm7 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-400 text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.password}
                      </p>}
                    </div>

                    <div>
                      <label className="block text-white text-base font-semibold mb-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Confirm Password
                        </div>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 glass border border-purple-400/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-md text-lg"
                        placeholder="Confirm password"
                      />
                      {errors.confirmPassword && <p className="text-red-400 text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.confirmPassword}
                      </p>}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-xl hover:shadow-purple-500/25"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Register Team
                    </div>
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-300">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300 transition-colors font-semibold hover:underline">
                      Sign In
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

export default RegisterPage;
