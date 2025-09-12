import React, { useState, useEffect } from 'react';
import round2Service from '../../../services/round2Service';

const Aptitude = ({ questionStep, onSubmit, teamProgress }) => {
    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Define questions locally (matching original quiz-3)
    const aptitudeQuestions = {
        0: {
            question: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correct: 1
        },
        1: {
            question: "Which data structure uses LIFO principle?",
            options: ["Queue", "Stack", "Array", "Linked List"],
            correct: 1
        },
        2: {
            question: "What does CPU stand for?",
            options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
            correct: 0
        }
    };

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                // Fetch question from API
                const response = await round2Service.getAptitudeQuestion(questionStep);
                if (response) {
                    setQuestion(response);
                    setSelected(null);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching question:', error);
                // Fallback to local questions if API fails
                const questionData = aptitudeQuestions[questionStep];
                if (questionData) {
                    setQuestion(questionData);
                    setSelected(null);
                }
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [questionStep]);

    const handleOptionClick = (index) => {
        setSelected(index);
    };

    const handleSubmit = async () => {
        if (selected !== null && !submitting) {
            setSubmitting(true);
            try {
                await onSubmit(selected);
            } catch (error) {
                console.error('Error submitting answer:', error);
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <div className="text-cyan-400 text-xl font-semibold">Loading question...</div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="text-red-400 text-xl font-semibold">Question not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-600 to-purple-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Aptitude Question {questionStep + 1}</h1>
                                <p className="text-cyan-100 mt-1">Choose the correct answer</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">Q{questionStep + 1}</div>
                                <div className="text-cyan-100 text-sm">Aptitude</div>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-white mb-6 leading-relaxed">
                                {question.question}
                            </h2>

                            <div className="space-y-4">
                                {question.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionClick(index)}
                                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${selected === index
                                            ? 'border-cyan-400 bg-cyan-400/10 shadow-lg'
                                            : 'border-slate-600 bg-slate-700 hover:border-cyan-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${selected === index
                                                ? 'border-cyan-400 bg-cyan-400'
                                                : 'border-slate-400'
                                                }`}>
                                                {selected === index && (
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                )}
                                            </div>
                                            <span className="text-white font-medium text-lg">
                                                {String.fromCharCode(65 + index)}. {option}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleSubmit}
                                disabled={selected === null || submitting}
                                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${selected === null || submitting
                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                                    }`}
                            >
                                {submitting ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </div>
                                ) : (
                                    'Submit Answer'
                                )}
                            </button>
                        </div>

                        {/* Progress Info */}
                        {teamProgress && (
                            <div className="mt-6 text-center">
                                <div className="text-slate-400 text-sm">
                                    Attempts left: {2 - (teamProgress.aptitudeAttempts?.[`q${questionStep + 1}`] || 0)}/2
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Aptitude;