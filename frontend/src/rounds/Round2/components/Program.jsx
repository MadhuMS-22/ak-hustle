import React, { useState, useEffect } from 'react';
import round2Service from '../../../services/round2Service';

const Program = ({ onSubmit, teamId }) => {
    const [code, setCode] = useState(`#include <stdio.h>

int main() {
    // Write your program here
    
    return 0;
}`);
    const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isSubmitted) {
            handleSubmit();
        }
    }, [timeLeft, isSubmitted]);

    // Auto-save every 2 seconds
    useEffect(() => {
        if (!isSubmitted && teamId) {
            const autoSaveInterval = setInterval(() => {
                const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                round2Service.autoSaveCodingSolution({
                    teamId,
                    challengeType: 'program',
                    solution: code,
                    timeTaken
                }).catch(error => {
                    console.error('Auto-save failed:', error);
                });
            }, 2000);

            return () => clearInterval(autoSaveInterval);
        }
    }, [code, teamId, isSubmitted, startTime]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = () => {
        if (!isSubmitted) {
            setIsSubmitted(true);
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            onSubmit(code, timeTaken);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-green-900 via-slate-900 to-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-white">💻 Program Challenge</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-white">
                            <span className="text-gray-300">Time Left:</span>
                            <span className={`ml-2 font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-green-400'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-4">Challenge: Array Operations</h2>
                        <p className="text-gray-300 mb-4">
                            Write a C program that performs the following operations on an array:
                        </p>

                        <div className="bg-slate-700 rounded-lg p-4 mb-4">
                            <h3 className="text-white font-semibold mb-2">Requirements:</h3>
                            <ul className="text-gray-300 space-y-1">
                                <li>• Declare an array of 10 integers</li>
                                <li>• Read 10 numbers from the user</li>
                                <li>• Find and display the maximum value</li>
                                <li>• Find and display the minimum value</li>
                                <li>• Calculate and display the average</li>
                            </ul>
                        </div>

                        <div className="bg-slate-700 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-2">Expected Output Format:</h3>
                            <pre className="text-green-400 font-mono text-sm">
                                {`Enter 10 numbers: 1 2 3 4 5 6 7 8 9 10
Maximum: 10
Minimum: 1
Average: 5.50`}
                            </pre>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Your Program:</h3>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-96 bg-slate-900 text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-slate-600"
                            placeholder="Write your C program here..."
                            disabled={isSubmitted}
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className={`px-8 py-3 rounded-lg font-bold text-lg transition duration-300 ${isSubmitted
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {isSubmitted ? 'Submitted ✓' : 'Submit Program'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Program;