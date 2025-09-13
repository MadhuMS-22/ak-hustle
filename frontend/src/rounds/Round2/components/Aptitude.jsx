import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';

const Aptitude = ({ questionStep, onSubmit, teamProgress }) => {
    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                const response = await apiService.get(`/quiz/apt/${questionStep}`);
                setQuestion(response);
                setSelected(null);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching question:', error);
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
                console.log('Submitting answer, selected:', selected);
                await onSubmit(selected);
                console.log('Answer submitted successfully');
            } catch (error) {
                console.error('Error submitting answer:', error);
                alert(`Error: ${error.message}`);
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
                    <div className="text-cyan-400 text-xl font-semibold mb-4">Question not found</div>
                    <div className="text-slate-300">Please try refreshing the page</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-cyan-400 mb-2">
                            Aptitude Question
                        </h2>
                        <div className="w-24 h-1 bg-cyan-400 mx-auto rounded-full mb-4"></div>
                        {teamProgress && (
                            <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-3 max-w-md mx-auto">
                                <p className="text-yellow-400 text-sm font-semibold">
                                    You have {2 - (teamProgress.aptitudeAttempts?.[`q${questionStep + 1}`] || 0)} out of 2 attempts remaining
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mb-8">
                        <div className="bg-slate-700 rounded-xl p-6 mb-6 border border-slate-600">
                            <p className="text-xl text-slate-200 leading-relaxed">{question.question}</p>
                        </div>

                        <div className="space-y-3">
                            {question.options.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleOptionClick(index)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${selected === index
                                        ? 'border-cyan-400 bg-cyan-400 text-slate-900 shadow-lg'
                                        : 'border-slate-600 hover:border-cyan-300 hover:bg-slate-700 text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center font-bold ${selected === index
                                            ? 'border-slate-900 bg-slate-900 text-cyan-400'
                                            : 'border-slate-500 text-slate-400'
                                            }`}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span className="text-lg font-medium">{option}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={selected === null || submitting}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${selected !== null && !submitting
                            ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-xl glow-purple'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Aptitude;