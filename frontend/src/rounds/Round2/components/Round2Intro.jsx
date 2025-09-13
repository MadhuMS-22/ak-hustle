import React from 'react';

const Round2Intro = ({ onStart, teamName }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🧠</div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Round 2: Coding Challenge
                        </h1>
                        <p className="text-xl text-gray-300">
                            Welcome, <span className="text-cyan-400 font-semibold">{teamName}</span>!
                        </p>
                    </div>

                    {/* Rules Section */}
                    <div className="space-y-6 mb-8">
                        <h2 className="text-2xl font-bold text-purple-300 mb-4">📋 How Round 2 Works</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Aptitude Questions */}
                            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-blue-300 mb-3">🎯 Aptitude Questions (Q1-Q3)</h3>
                                <ul className="space-y-2 text-gray-200">
                                    <li>• Answer 3 multiple-choice questions</li>
                                    <li>• Each question has 2 attempts</li>
                                    <li>• Correct on 1st attempt = 10 points</li>
                                    <li>• Correct on 2nd attempt = 5 points</li>
                                    <li>• Complete Q1 to unlock Debug challenge</li>
                                </ul>
                            </div>

                            {/* Coding Challenges */}
                            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-green-300 mb-3">💻 Coding Challenges (Q4-Q6)</h3>
                                <ul className="space-y-2 text-gray-200">
                                    <li>• Debug: Fix the bug in C code (15 points)</li>
                                    <li>• Trace: Explain program output (15 points)</li>
                                    <li>• Program: Write C program (15 points)</li>
                                    <li>• Complete each to unlock next</li>
                                </ul>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-yellow-300 mb-3">⚠️ Important Notes</h3>
                            <ul className="space-y-2 text-gray-200">
                                <li>• <strong>Sequential Unlocking:</strong> Complete questions in order</li>
                                <li>• <strong>Time Limit:</strong> 5 minutes per coding challenge</li>
                                <li>• <strong>No Going Back:</strong> Once submitted, you cannot change answers</li>
                                <li>• <strong>Auto-Save:</strong> Your progress is saved automatically</li>
                                <li>• <strong>Total Points:</strong> 90 points maximum</li>
                            </ul>
                        </div>

                        {/* Scoring Breakdown */}
                        <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-purple-300 mb-3">🏆 Scoring Breakdown</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">30</div>
                                    <div className="text-sm">Aptitude Questions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">45</div>
                                    <div className="text-sm">Coding Challenges</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">90</div>
                                    <div className="text-sm">Total Possible</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <div className="text-center">
                        <button
                            onClick={onStart}
                            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl text-xl"
                        >
                            🚀 Start Round 2
                        </button>
                        <p className="text-gray-400 text-sm mt-4">
                            Click to begin your coding challenge journey!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Round2Intro;
