import React, { useState, useEffect } from 'react';
import apiService from '../../../services/api';

const AdminDashboard = () => {
    const [overview, setOverview] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchOverview();
        fetchLeaderboard();
    }, []);

    const fetchOverview = async () => {
        try {
            setRefreshing(true);
            const response = await apiService.get('/admin/overview');
            setOverview(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching overview:', error);
            setLoading(false);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await apiService.get('/admin/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    const getStepName = (step) => {
        switch (step) {
            case 1: return 'Debug';
            case 3: return 'Trace';
            case 5: return 'Program';
            default: return 'Unknown';
        }
    };

    const getStepColor = (step) => {
        switch (step) {
            case 1: return 'bg-blue-600 text-white';
            case 3: return 'bg-green-600 text-white';
            case 5: return 'bg-orange-600 text-white';
            default: return 'bg-slate-600 text-white';
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <div className="text-cyan-400 text-xl font-semibold">Loading admin data...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Admin Dashboard</h1>
                            <p className="text-slate-300 text-lg">Team progress and submission overview</p>
                        </div>
                        <button
                            onClick={() => {
                                fetchOverview();
                                fetchLeaderboard();
                            }}
                            disabled={refreshing}
                            className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-500 transform hover:scale-105 shadow-xl glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-4 mt-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'overview'
                                ? 'bg-cyan-600 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'leaderboard'
                                ? 'bg-cyan-600 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            Leaderboard
                        </button>
                    </div>
                </div>

                {activeTab === 'leaderboard' ? (
                    <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-6">🏆 Leaderboard</h2>

                        {leaderboard.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏆</div>
                                <h3 className="text-xl font-bold text-slate-200 mb-2">No Completed Teams Yet</h3>
                                <p className="text-slate-400">Teams will appear here once they complete the quiz.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leaderboard.map((team, index) => (
                                    <div key={team.teamName} className={`p-6 rounded-xl border transition-all duration-200 ${index === 0 ? 'border-yellow-400 bg-yellow-400/10' :
                                        index === 1 ? 'border-gray-300 bg-gray-300/10' :
                                            index === 2 ? 'border-orange-400 bg-orange-400/10' :
                                                'border-slate-600 bg-slate-700'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                    index === 1 ? 'bg-gray-300 text-gray-900' :
                                                        index === 2 ? 'bg-orange-400 text-orange-900' :
                                                            'bg-slate-600 text-slate-200'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-200">{team.teamName}</h3>
                                                    <p className="text-slate-400">Completed: {formatDate(team.endTime)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-cyan-400">{team.totalScore}/60</div>
                                                <div className="text-slate-400">{team.timeFormatted}</div>
                                            </div>
                                        </div>

                                        {/* Score Breakdown */}
                                        <div className="mt-4 grid grid-cols-6 gap-2">
                                            {Object.entries(team.scores).map(([question, score]) => (
                                                <div key={question} className="text-center">
                                                    <div className="text-xs text-slate-400 uppercase">{question}</div>
                                                    <div className="text-sm font-semibold text-slate-200">{score}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Attempts Info */}
                                        <div className="mt-4 flex space-x-4 text-sm">
                                            <div className="text-slate-400">
                                                Q1 Attempts: {team.aptitudeAttempts.q1}/2
                                            </div>
                                            <div className="text-slate-400">
                                                Q2 Attempts: {team.aptitudeAttempts.q2}/2
                                            </div>
                                            <div className="text-slate-400">
                                                Q3 Attempts: {team.aptitudeAttempts.q3}/2
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : overview.length === 0 ? (
                    <div className="bg-slate-800 rounded-2xl shadow-xl p-12 text-center border border-slate-700">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-2xl font-bold text-slate-200 mb-2">No Teams Yet</h3>
                        <p className="text-slate-400 text-lg">Teams will appear here once they register and start the quiz.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {overview.map((teamData) => (
                            <div key={teamData.team.id} className="bg-slate-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200 border border-slate-700">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-2xl font-bold text-slate-200">{teamData.team.name}</h3>
                                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            Step {teamData.team.currentStep}/6
                                        </div>
                                    </div>
                                    {teamData.team.startTime && (
                                        <p className="text-sm text-slate-400">
                                            Started: {formatDate(teamData.team.startTime)}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-200 text-lg flex items-center">
                                        <span className="bg-slate-600 text-slate-200 px-2 py-1 rounded-lg text-sm font-semibold mr-2">📝</span>
                                        Submissions
                                    </h4>
                                    {teamData.submissions.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-2">⏳</div>
                                            <p className="text-slate-400 text-sm">No submissions yet</p>
                                        </div>
                                    ) : (
                                        teamData.submissions.map((submission, index) => (
                                            <div key={index} className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStepColor(submission.step)}`}>
                                                        {getStepName(submission.step)}
                                                    </span>
                                                    <span className="text-sm text-slate-400 font-mono">
                                                        {formatTime(submission.timeTaken)}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-400 mb-1">Code:</div>
                                                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
                                                            <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                                                                {submission.code.substring(0, 150)}
                                                                {submission.code.length > 150 && '...'}
                                                            </pre>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-400 mb-1">Output:</div>
                                                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
                                                            <pre className="text-xs text-slate-300 font-mono">
                                                                {submission.output}
                                                            </pre>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-600">
                                                        Submitted: {formatDate(submission.submittedAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;