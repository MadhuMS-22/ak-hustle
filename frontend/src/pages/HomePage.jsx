import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-sans antialiased text-white min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        {/* Hero Section */}
        <section className="py-12 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white bg-opacity-10 text-purple-300 shadow-xl backdrop-blur-md border border-white border-opacity-20 hover:scale-105 transition-transform duration-300">
                {/* Replace the src with your main icon image URL */}
                <img src="https://placehold.co/64x64/E9D5FF/6D28D9?text=</>" alt="Coding Icon" className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Hustle
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              Premier technical competition designed to push the boundaries of coding and problem-solving.
              <span className="block mt-2 text-base sm:text-lg text-purple-200">
                Challenge yourself with complex puzzles and dynamic coding challenges in a high-stakes, timed environment.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-lg font-bold rounded-xl shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25"
              >
                Register Your Team
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center px-8 py-4 bg-white bg-opacity-10 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 backdrop-blur-md border border-white border-opacity-20"
              >
                Sign In
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Competition Format Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Competition Format
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Three exciting rounds designed to test different aspects of your coding skills
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Round 1 Card */}
              <div className="group bg-white bg-opacity-10 p-6 rounded-2xl shadow-xl border border-white border-opacity-20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-opacity-15 hover:shadow-emerald-500/20">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 bg-opacity-20 text-emerald-300 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                    {/* Replace the src with your Round 1 image URL */}
                    <img src="https://placehold.co/40x40/D1FAE5/065F46?text=R1" alt="Round 1 icon" className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Round 1: Aptitude</h3>
                <p className="text-sm text-gray-300 text-center mb-6 leading-relaxed">
                  Test your logical thinking and problem-solving abilities with brain teasers and puzzles.
                </p>
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-emerald-500 bg-opacity-20 text-emerald-200 text-xs font-bold rounded-full border border-emerald-400 border-opacity-30 shadow-md backdrop-blur-md">
                    Duration: 45 minutes
                  </span>
                </div>
              </div>

              {/* Round 2 Card */}
              <div className="group bg-white bg-opacity-10 p-6 rounded-2xl shadow-xl border border-white border-opacity-20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-opacity-15 hover:shadow-indigo-500/20">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 bg-opacity-20 text-indigo-300 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                    {/* Replace the src with your Round 2 image URL */}
                    <img src="https://placehold.co/40x40/E0E7FF/4338CA?text=R2" alt="Round 2 icon" className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Round 2: Coding</h3>
                <p className="text-sm text-gray-300 text-center mb-6 leading-relaxed">
                  Sequential puzzle unlock system. Solve programming challenges to advance through levels.
                </p>
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-indigo-500 bg-opacity-20 text-indigo-200 text-xs font-bold rounded-full border border-indigo-400 border-opacity-30 shadow-md backdrop-blur-md">
                    Duration: 2 hours
                  </span>
                </div>
              </div>

              {/* Round 3 Card */}
              <div className="group bg-white bg-opacity-10 p-6 rounded-2xl shadow-xl border border-white border-opacity-20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-opacity-15 hover:shadow-purple-500/20">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 bg-opacity-20 text-purple-300 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                    {/* Replace the src with your Round 3 image URL */}
                    <img src="https://placehold.co/40x40/EDE9FE/6D28D9?text=R3" alt="Round 3 icon" className="h-10 w-10" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-3">Round 3: Final</h3>
                <p className="text-sm text-gray-300 text-center mb-6 leading-relaxed">
                  Advanced algorithms and complex problem-solving for qualified teams only.
                </p>
                <div className="text-center">
                  <span className="inline-block px-4 py-2 bg-purple-500 bg-opacity-20 text-purple-200 text-xs font-bold rounded-full border border-purple-400 border-opacity-30 shadow-md backdrop-blur-md">
                    Duration: 3 hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
