import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChallengeSelection = ({ onStart }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 text-white text-center">
                    <h2 className="text-4xl font-bold text-cyan-400 mb-4">
                        Welcome to Round 2: The Coding Challenge
                    </h2>
                    <p className="text-lg text-slate-300 mb-6">
                        Prepare to test your problem-solving and coding skills. You will face a series of challenges that must be completed sequentially.
                    </p>
                    <div className="bg-slate-700 rounded-xl p-6 mb-8 border border-slate-600">
                        <h3 className="text-xl font-bold text-slate-200 mb-3">Rules and Format:</h3>
                        <ul className="text-left text-slate-300 space-y-2 list-disc list-inside">
                            <li>Complete three aptitude questions to unlock the three coding challenges.</li>
                            <li>Each aptitude question has **two attempts**. A correct first attempt gives **2 points**, while a correct second attempt gives **1 point**.</li>
                            <li>The coding challenges (Debug, Trace, Program) do not award points directly. Submissions will be reviewed by administrators.</li>
                            <li>Each coding challenge has a 5-minute timer.</li>
                        </ul>
                    </div>
                    <button
                        onClick={onStart}
                        className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-500 hover:scale-105 transform shadow-2xl glow-purple"
                    >
                        Start Round 2 Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChallengeSelection;