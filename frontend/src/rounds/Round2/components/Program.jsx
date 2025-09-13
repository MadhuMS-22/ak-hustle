import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/api';

const Program = ({ onSubmit, teamId }) => {
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const autoSaveTimeoutRef = useRef(null);

    const sampleOutput = `Enter a number: 5
Fibonacci sequence up to 5 terms:
0 1 1 2 3`;

    const problemStatement = `Write a C program that:
1. Takes a number n as input
2. Prints the first n terms of the Fibonacci sequence
3. Each term should be separated by a space

Example:
Input: 5
Output: 0 1 1 2 3`;

    useEffect(() => {
        let interval = null;

        // Auto-start timer when component mounts
        if (!isRunning && timeLeft === 1500) {
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
        if (code.trim() && teamId) {
            try {
                const timeTaken = Math.max(0, 1500 - timeLeft);
                await apiService.post('/quiz/code/autosave', {
                    teamId,
                    challengeType: 'program',
                    code,
                    timeTaken: timeTaken
                });
                console.log('Auto-saved program progress');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    };

    // Auto-save on code change
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
    }, [code]);

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
        if (!code.trim() || submitting) return;

        setSubmitting(true);
        const timeTaken = Math.max(0, 1500 - timeLeft); // Ensure it's never negative or NaN

        try {
            await onSubmit(code, timeTaken);
        } catch (error) {
            console.error('Error submitting code:', error);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-cyan-400 mb-2">Write The Program</h2>
                            <div className="w-16 h-1 bg-cyan-400 rounded-full"></div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
                                }`}>
                                Time Left: {formatTime(timeLeft)}
                            </div>
                            {!isRunning && timeLeft === 1500 && (
                                <div className="mt-3 text-orange-400 text-sm">
                                    Timer starting automatically...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
                        <h3 className="text-xl font-bold text-slate-200 mb-3">Problem Statement:</h3>
                        <div className="bg-slate-800 rounded-lg p-4 border-l-4 border-orange-500">
                            <pre className="text-slate-300 whitespace-pre-line font-mono text-sm leading-relaxed">{problemStatement}</pre>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-200 mb-4 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold mr-3">SAMPLE</span>
                            Sample Output
                        </h3>
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-600">
                            <pre className="text-green-400 text-sm font-mono leading-relaxed">
                                <code>{sampleOutput}</code>
                            </pre>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-200 mb-4 flex items-center">
                            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold mr-3">CODE</span>
                            Your Code
                        </h3>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Write your C program here..."
                            className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-xl font-mono text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200"
                        />

                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!code.trim() || timeLeft === 0 || submitting}
                                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${code.trim() && timeLeft > 0 && !submitting
                                    ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-xl glow-purple'
                                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Program'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Program;