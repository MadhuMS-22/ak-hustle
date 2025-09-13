import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 font-sans antialiased text-white min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        {/* Hero Section */}
        <section className="py-12 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-3xl glass-dark text-purple-300 shadow-2xl hover:scale-110 transition-all duration-500 glow-purple">
                {/* Replace the src with your main icon image URL */}
                <img src="https://placehold.co/64x64/E9D5FF/6D28D9?text=</>" alt="Coding Icon" className="h-16 w-16" />
              </div>
            </div>
            <h1 className="text-6xl sm:text-7xl font-extrabold text-white leading-tight mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
              Hustle
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
              Premier technical competition designed to push the boundaries of coding and problem-solving.
              <span className="block mt-4 text-lg sm:text-xl text-purple-300 font-medium">
                Challenge yourself with complex puzzles and dynamic coding challenges in a high-stakes, timed environment.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="group flex items-center justify-center px-10 py-5 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white text-xl font-bold rounded-2xl shadow-2xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-500 transform hover:scale-110 glow-purple"
              >
                Register Your Team
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Competition Format Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                Competition Format
              </h2>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Three exciting rounds designed to test different aspects of your coding skills
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Round 1 Card */}
              <div className="group glass-dark p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:glow-purple">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md group-hover:scale-110 transition-transform duration-500 glow-purple">
                    {/* Replace the src with your Round 1 image URL */}
                    <img src="https://placehold.co/40x40/E9D5FF/6D28D9?text=R1" alt="Round 1 icon" className="h-12 w-12" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">Round 1: Aptitude</h3>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                  Test your logical thinking and problem-solving abilities with brain teasers and puzzles.
                </p>
                <div className="text-center">
                  <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                    Duration: 45 minutes
                  </span>
                </div>
              </div>

              {/* Round 2 Card */}
              <div className="group glass-dark p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:glow-purple">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md group-hover:scale-110 transition-transform duration-500 glow-purple">
                    {/* Replace the src with your Round 2 image URL */}
                    <img src="https://placehold.co/40x40/DBEAFE/3B82F6?text=R2" alt="Round 2 icon" className="h-12 w-12" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">Round 2: Coding</h3>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                  Sequential puzzle unlock system. Solve programming challenges to advance through levels.
                </p>
                <div className="text-center">
                  <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                    Duration: 2 hours
                  </span>
                </div>
              </div>

              {/* Round 3 Card */}
              <div className="group glass-dark p-8 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:glow-purple">
                <div className="flex justify-center mb-8">
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-md group-hover:scale-110 transition-transform duration-500 glow-purple">
                    {/* Replace the src with your Round 3 image URL */}
                    <img src="https://placehold.co/40x40/EDE9FE/6D28D9?text=R3" alt="Round 3 icon" className="h-12 w-12" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">Round 3: Final</h3>
                <p className="text-gray-300 text-center mb-8 leading-relaxed">
                  Advanced algorithms and complex problem-solving for qualified teams only.
                </p>
                <div className="text-center">
                  <span className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
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
