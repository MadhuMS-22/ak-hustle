import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../../services/api';

const Debug = ({ onSubmit, teamId }) => {
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const autoSaveTimeoutRef = useRef(null);

    const codeToDebug = `#include <stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int i = 0; i <= 5; i++) {
        sum += arr[i];
    }
    
    printf("Sum: %d\\n", sum);
    return 0;
}`;

    // Initialize code only once when component mounts
    useEffect(() => {
        setCode(codeToDebug);
    }, []);

    useEffect(() => {
        let interval = null;

        // Auto-start timer when component mounts
        if (!isRunning && timeLeft === 300) {
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
                const timeTaken = Math.max(0, 300 - timeLeft); // Ensure it's never negative or NaN
                await apiService.post('/quiz/code/autosave', {
                    teamId,
                    challengeType: 'debug',
                    code,
                    timeTaken: timeTaken
                });
                console.log('Auto-saved debug progress');
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
        const timeTaken = Math.max(0, 300 - timeLeft); // Ensure it's never negative or NaN

        try {
            await onSubmit(code, timeTaken);
        } catch (error) {
            console.error('Error submitting solution:', error);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-cyan-400 mb-2">Debug The Program</h2>
                            <div className="w-16 h-1 bg-cyan-400 rounded-full"></div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
                                }`}>
                                Time Left: {formatTime(timeLeft)}
                            </div>
                            {!isRunning && timeLeft === 300 && (
                                <div className="mt-3 text-green-400 text-sm">
                                    Timer starting automatically...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
                        <h3 className="text-xl font-bold text-slate-200 mb-3">Instructions:</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Find and fix the bug in the following C code. The program should calculate the sum of array elements correctly.
                            Look for the off-by-one error in the loop condition.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-200 mb-4 flex items-center">
                        <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold mr-3">DEBUG</span>
                        Fix the Code Below
                    </h3>

                    <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                        <p className="text-slate-300 text-sm">
                            Find and fix the bug in the code below.
                        </p>
                    </div>

                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Fix the code here..."
                        className="w-full h-80 p-4 bg-slate-900 border border-slate-600 rounded-xl font-mono text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200"
                    />

                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={!code.trim() || timeLeft === 0 || submitting}
                            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${code.trim() && timeLeft > 0 && !submitting
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Solution'}
                        </button>

                        <button
                            onClick={() => setCode(codeToDebug)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-500 shadow-xl glow-purple"
                        >
                            Reset Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Debug;