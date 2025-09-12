import React, { useState, useEffect } from 'react';
import round2Service from '../../../services/round2Service';

const Debug = ({ onSubmit, teamId }) => {
    const [code, setCode] = useState(`#include <stdio.h>
int main() {
    int num1, num2, sum;

    printf("Enter first number: ");
    scanf("%d", &num1);

    printf("Enter second number: ");
    scanf("%d", &num2);

    sum = num1 + num2;

    printf("Sum = %d\\n", sum);

    return 0;
}`);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
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
                    challengeType: 'debug',
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
        <div className="h-screen bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-white">🐛 Debug Challenge</h1>
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
                        <h2 className="text-xl font-bold text-white mb-4">Challenge: Sum of Two Numbers</h2>
                        <p className="text-gray-300 mb-4">
                            The code below has bugs. Find and fix them to make it work correctly.
                        </p>
                        <div className="bg-slate-700 rounded-lg p-4 mb-4">
                            <h3 className="text-white font-semibold mb-2">Expected Output:</h3>
                            <pre className="text-green-400 font-mono text-sm">
                                {`Enter first number: 5
Enter second number: 7
Sum = 12`}
                            </pre>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Your Code:</h3>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-96 bg-slate-900 text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-600"
                            placeholder="Fix the bugs in the code above..."
                            disabled={isSubmitted}
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className={`px-8 py-3 rounded-lg font-bold text-lg transition duration-300 ${isSubmitted
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {isSubmitted ? 'Submitted ✓' : 'Submit Solution'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Debug;