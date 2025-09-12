import React, { useState, useEffect } from 'react';
import round2Service from '../../../services/round2Service';

const Trace = ({ onSubmit, teamId }) => {
    const [trace, setTrace] = useState('');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
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
                    challengeType: 'trace',
                    solution: trace,
                    timeTaken
                }).catch(error => {
                    console.error('Auto-save failed:', error);
                });
            }, 2000);

            return () => clearInterval(autoSaveInterval);
        }
    }, [trace, teamId, isSubmitted, startTime]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = () => {
        if (!isSubmitted) {
            setIsSubmitted(true);
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            onSubmit(trace, timeTaken);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-yellow-900 via-slate-900 to-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-white">🔍 Trace Challenge</h1>
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
                        <h2 className="text-xl font-bold text-white mb-4">Challenge: Trace Recursive Function</h2>
                        <p className="text-gray-300 mb-4">
                            Trace through the execution of the following recursive function when called with factorial(4).
                        </p>

                        <div className="bg-slate-700 rounded-lg p-4 mb-4">
                            <h3 className="text-white font-semibold mb-2">Function:</h3>
                            <pre className="text-blue-400 font-mono text-sm">
                                {`int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}`}
                            </pre>
                        </div>

                        <div className="bg-slate-700 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-2">Function Call:</h3>
                            <pre className="text-green-400 font-mono text-sm">
                                factorial(4)
                            </pre>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Your Trace:</h3>
                        <p className="text-gray-300 mb-4">
                            Show the step-by-step execution, including all recursive calls and return values.
                        </p>
                        <textarea
                            value={trace}
                            onChange={(e) => setTrace(e.target.value)}
                            className="w-full h-96 bg-slate-900 text-white p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-slate-600"
                            placeholder="Enter your trace here...&#10;&#10;Example:&#10;factorial(4)&#10;  n = 4, n > 1, so return 4 * factorial(3)&#10;  factorial(3)&#10;    n = 3, n > 1, so return 3 * factorial(2)&#10;    ..."
                            disabled={isSubmitted}
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitted}
                            className={`px-8 py-3 rounded-lg font-bold text-lg transition duration-300 ${isSubmitted
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                }`}
                        >
                            {isSubmitted ? 'Submitted ✓' : 'Submit Trace'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trace;