import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-black bg-opacity-20 backdrop-blur-md z-50 shadow-lg border-b border-white border-opacity-10 transition-all duration-300">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 group">
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 bg-opacity-20 text-purple-300 shadow-lg flex items-center justify-center backdrop-blur-md border border-white border-opacity-20 group-hover:scale-110 transition-transform duration-300">
                <img src="https://placehold.co/24x24/E9D5FF/6D28D9?text=</>" alt="Hustle Logo" className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">Hustle</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 hover:bg-white hover:bg-opacity-10 rounded-lg backdrop-blur-md"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105 transform backdrop-blur-md"
            >
              Register Team
            </button>
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
          <div className="md:hidden mt-4 py-4 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl border border-white border-opacity-20 shadow-xl">
            <div className="flex flex-col space-y-4 px-6">
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-6 py-4 text-lg font-semibold text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 rounded-xl transition-all duration-300"
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
                className="w-full text-left px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Register Team
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
