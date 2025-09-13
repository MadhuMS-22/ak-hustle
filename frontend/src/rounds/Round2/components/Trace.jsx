import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/api';

const Trace = ({ onSubmit, teamId }) => {
    const [output, setOutput] = useState('');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const autoSaveTimeoutRef = useRef(null);

    const codeToTrace = `#include <stdio.h>

int mystery(int n) {
    if (n <= 1) return 1;
    return n * mystery(n - 1);
}

int main() {
    int result = mystery(4);
    printf("Result: %d\\n", result);
    return 0;
}`;

    useEffect(() => {
        let interval = null;

        // Auto-start timer when component mounts
        if (!isRunning && timeLeft === 900) {
            setIsRunning(true);
        }

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSubmit();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    // Auto-save functionality
    const autoSave = async () => {
        if (output.trim() && teamId) {
            try {
                const timeTaken = Math.max(0, 900 - timeLeft);
                await apiService.post('/quiz/code/autosave', {
                    teamId,
                    challengeType: 'trace',
                    code: output,
                    timeTaken: timeTaken
                });
                console.log('Auto-saved trace progress');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    };

    // Auto-save on output change
    useEffect(() => {
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            autoSave();
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [output]);

    // Auto-save when timer ends
    useEffect(() => {
        if (timeLeft === 0) {
            autoSave();
        }
    }, [timeLeft]);

    const startTimer = () => {
        setIsRunning(true);
    };

    const handleSubmit = async () => {
        if (!output.trim() || submitting) return;

        setSubmitting(true);
        const timeTaken = Math.max(0, 900 - timeLeft); // Ensure it's never negative or NaN
        const code = codeToTrace; // The code being traced

        try {
            await onSubmit(code, timeTaken);
        } catch (error) {
            console.error('Error submitting output:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-cyan-400 mb-2">Trace The Program</h2>
                            <div className="w-16 h-1 bg-cyan-400 rounded-full"></div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
                                }`}>
                                Time Left: {formatTime(timeLeft)}
                            </div>
                            {!isRunning && timeLeft === 900 && (
                                <div className="mt-3 text-green-400 text-sm">
                                    Timer starting automatically...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
                        <h3 className="text-xl font-bold text-slate-200 mb-3">Instructions:</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Trace through the following recursive function and determine what output it will produce.
                            This is a factorial function - trace through the recursive calls step by step.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-200 mb-4 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold mr-3">PROGRAM</span>
                            Program Code
                        </h3>
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-600">
                            <pre className="text-green-400 text-sm font-mono leading-relaxed">
                                <code>{codeToTrace}</code>
                            </pre>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-200 mb-4 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold mr-3">OUTPUT</span>
                            Trace Output
                        </h3>
                        <textarea
                            value={output}
                            onChange={(e) => setOutput(e.target.value)}
                            placeholder="Enter the expected output here..."
                            className="w-full h-32 p-4 bg-slate-900 border border-slate-600 rounded-xl font-mono text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200"
                        />

                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!output.trim() || timeLeft === 0 || submitting}
                                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${output.trim() && timeLeft > 0 && !submitting
                                    ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-xl glow-purple'
                                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Trace'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trace;