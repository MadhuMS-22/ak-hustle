import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, teamData, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full glass-dark z-50 shadow-2xl border-b border-purple-400/30 transition-all duration-300">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/')} className="flex items-center space-x-3 group">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-all duration-500 glow-purple">
                <img src="https://placehold.co/24x24/E9D5FF/6D28D9?text=</>" alt="Hustle Logo" className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Hustle</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-300">
                  Welcome, {teamData?.teamName || 'Team'}!
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500 hover:bg-opacity-20 transition-all duration-300 rounded-lg backdrop-blur-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 hover:bg-purple-500/20 rounded-xl backdrop-blur-md border border-purple-400/30 hover:border-purple-400/50"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white text-sm font-bold rounded-xl shadow-xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-500 hover:scale-105 transform glow-purple"
                >
                  Register Team
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-xl transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-6 glass-dark rounded-3xl shadow-2xl">
            <div className="flex flex-col space-y-4 px-6">
              {isAuthenticated ? (
                <>
                  <div className="px-6 py-3 text-sm text-gray-300 border-b border-purple-400/30">
                    Welcome, {teamData?.teamName || 'Team'}!
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-6 py-4 text-lg font-semibold text-red-300 hover:text-red-200 hover:bg-red-500 hover:bg-opacity-20 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4 4m0 0l-4 4m4-4H7m13 0v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
                      </svg>
                      Logout
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-6 py-4 text-lg font-semibold text-gray-300 hover:text-white hover:bg-purple-500/20 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 rounded-xl shadow-xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-500 glow-purple"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Register Team
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
