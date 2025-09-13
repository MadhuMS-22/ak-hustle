import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAuthService from '../services/adminAuthService';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Check if admin is already logged in
    useEffect(() => {
        if (adminAuthService.isAdminAuthenticated()) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        console.log('Form submitted with data:', formData);

        try {
            const response = await adminAuthService.adminLogin(formData);
            console.log('Login response received:', response);

            if (response.success) {
                setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
                setTimeout(() => {
                    navigate('/admin');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: response.message || 'Login failed' });
            }
        } catch (error) {
            console.error('Admin login error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Login failed. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-gray-300">Access the competition administration panel</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter admin username"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter admin password"
                            />
                        </div>

                        {/* Message Display */}
                        {message.text && (
                            <div className={`p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-500/20 border border-green-400/30 text-green-100'
                                : 'bg-red-500/20 border border-red-400/30 text-red-100'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-500 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-xl glow-purple"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Logging in...
                                </div>
                            ) : (
                                'Login to Admin Panel'
                            )}
                        </button>
                    </form>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-white/70 hover:text-white transition-colors duration-200"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <p className="text-yellow-100 text-sm font-medium">Security Notice</p>
                            <p className="text-yellow-200/80 text-xs mt-1">
                                This is a secure admin area. All login attempts are logged and monitored.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
