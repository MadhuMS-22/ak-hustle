import React, { useState, useEffect } from 'react';
import adminAuthService from '../services/adminAuthService';

const Round2AdminDashboard = () => {
    const [round2Data, setRound2Data] = useState({
        teams: [],
        submissions: [],
        statistics: {
            totalParticipants: 0,
            completedTeams: 0,
            averageScore: 0,
            highestScore: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedTeams, setExpandedTeams] = useState(new Set());

    // Helper function to make admin API calls
    const adminApiCall = async (endpoint, options = {}) => {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5009/api'}${endpoint}`;
        const headers = adminAuthService.getAdminHeaders();

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    };

    // Fetch Round 2 admin data
    const fetchRound2Data = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApiCall('/admin/round2/data');
            setRound2Data(response.data);
        } catch (err) {
            console.error('Error fetching Round 2 data:', err);
            setError('Failed to fetch Round 2 data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch team's specific submissions
    const fetchTeamSubmissions = async (teamId) => {
        try {
            const response = await adminApiCall(`/admin/round2/team/${teamId}/submissions`);
            setSelectedTeam(response.data);
        } catch (err) {
            console.error('Error fetching team submissions:', err);
            setError('Failed to fetch team submissions');
        }
    };

    useEffect(() => {
        fetchRound2Data();
    }, []);

    // Sort teams by score
    const sortedTeams = round2Data.teams.sort((a, b) => b.totalScore - a.totalScore);

    const formatTime = (seconds) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getLeaderName = (team) => {
        return team.leader === 'member1'
            ? team.members?.member1?.name
            : team.members?.member2?.name;
    };

    const getQuestionTypeLabel = (questionType, challengeType) => {
        if (questionType === 'aptitude') {
            return `Aptitude Q${challengeType || ''}`;
        }
        return challengeType?.charAt(0).toUpperCase() + challengeType?.slice(1) || 'Unknown';
    };

    const getScoreColor = (score) => {
        if (score >= 15) return 'text-green-400';
        if (score >= 10) return 'text-yellow-400';
        if (score >= 5) return 'text-orange-400';
        return 'text-red-400';
    };

    const handleViewSubmissions = async (team) => {
        if (expandedTeams.has(team._id)) {
            // Collapse the team
            setExpandedTeams(prev => {
                const newSet = new Set(prev);
                newSet.delete(team._id);
                return newSet;
            });
        } else {
            // Expand the team and fetch submissions
            setExpandedTeams(prev => new Set([...prev, team._id]));
            if (!team.submissions) {
                await fetchTeamSubmissions(team._id);
            }
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400 text-lg">{error}</p>
                <button
                    onClick={fetchRound2Data}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Round 2 Admin Dashboard
                </h1>
                <p className="text-lg text-gray-300">Monitor team progress and view submissions</p>
            </div>

            {/* Main Table - Single Layout */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-t-xl">
                    <h2 className="text-2xl font-bold text-white text-center">Round 2 Results</h2>
                </div>

                <div className="p-6">
                    {/* Table Headers */}
                    <div className="grid grid-cols-12 gap-4 mb-4 pb-2 border-b border-white/20">
                        <div className="col-span-1 text-sm font-medium text-gray-300">Teams</div>
                        <div className="col-span-2 text-sm font-medium text-gray-300">Total Score</div>
                        <div className="col-span-2 text-sm font-medium text-gray-300">Total Time Taken</div>
                        <div className="col-span-2 text-sm font-medium text-gray-300">Aptitude Scores</div>
                        <div className="col-span-2 text-sm font-medium text-gray-300">Status</div>
                        <div className="col-span-3 text-sm font-medium text-gray-300">Actions</div>
                    </div>

                    {/* Team Rows */}
                    <div className="space-y-2">
                        {sortedTeams.map((team, index) => {
                            const isExpanded = expandedTeams.has(team._id);
                            const teamSubmissions = team.submissions || [];
                            const mainSubmissions = teamSubmissions.filter(sub =>
                                ['debug', 'trace', 'program'].includes(sub.challengeType)
                            );

                            return (
                                <div key={team._id} className="space-y-2">
                                    {/* Main Team Row */}
                                    <div className="grid grid-cols-12 gap-4 py-4 px-4 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                                        <div className="col-span-1">
                                            <div className="text-white font-bold text-lg">#{index + 1}</div>
                                            <div className="text-white font-medium">{team.teamName}</div>
                                            <div className="text-gray-400 text-sm">{getLeaderName(team)}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className={`text-2xl font-bold ${getScoreColor(team.totalScore)}`}>
                                                {team.totalScore}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-white text-lg font-medium">
                                                {formatTime(team.totalTimeTaken)}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex space-x-2">
                                                <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                                    Q1: {team.scores.q1 || 0}
                                                </div>
                                                <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                                    Q2: {team.scores.q2 || 0}
                                                </div>
                                                <div className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                                    Q3: {team.scores.q3 || 0}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${team.isQuizCompleted
                                                ? 'bg-green-500/20 text-green-300'
                                                : 'bg-yellow-500/20 text-yellow-300'
                                                }`}>
                                                {team.isQuizCompleted ? 'Completed' : 'In Progress'}
                                            </span>
                                        </div>
                                        <div className="col-span-3">
                                            <button
                                                onClick={() => handleViewSubmissions(team)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                                            >
                                                {isExpanded ? 'Hide Answers' : 'View Submitted Score'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Answers Section */}
                                    {isExpanded && (
                                        <div className="bg-white/5 rounded-lg p-4 ml-4 border border-white/10">
                                            <h4 className="text-white font-semibold text-lg mb-4">Main Challenge Answers:</h4>
                                            {mainSubmissions.length > 0 ? (
                                                <div className="space-y-4">
                                                    {mainSubmissions.map((submission, subIndex) => (
                                                        <div key={submission._id} className="bg-white/10 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h5 className="text-white font-semibold text-lg">
                                                                    Question {subIndex + 1}: {submission.challengeType.charAt(0).toUpperCase() + submission.challengeType.slice(1)} Challenge
                                                                </h5>
                                                                <div className="text-right">
                                                                    <div className={`text-lg font-bold ${getScoreColor(submission.score)}`}>
                                                                        Score: {submission.score}
                                                                    </div>
                                                                    <div className={`text-sm ${submission.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                                        {submission.isCorrect ? 'Correct' : 'Incorrect'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div>
                                                                    <label className="text-gray-400 text-sm font-medium">Original Question:</label>
                                                                    <div className="bg-gray-800 rounded-lg p-3 mt-1">
                                                                        <pre className="text-gray-300 whitespace-pre-wrap text-sm">
                                                                            {submission.originalQuestion}
                                                                        </pre>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="text-gray-400 text-sm font-medium">Team's Solution:</label>
                                                                    <div className="bg-gray-800 rounded-lg p-3 mt-1">
                                                                        <pre className="text-gray-300 whitespace-pre-wrap text-sm">
                                                                            {submission.userSolution}
                                                                        </pre>
                                                                    </div>
                                                                </div>

                                                                <div className="flex justify-between text-sm text-gray-400 bg-white/5 rounded-lg p-2">
                                                                    <span>Time Taken: {submission.timeTaken}s</span>
                                                                    <span>Attempt: #{submission.attemptNumber}</span>
                                                                    <span>Submitted: {new Date(submission.createdAt).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-400">
                                                    <div className="text-4xl mb-2">📝</div>
                                                    <p>No main challenge submissions found for this team</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {sortedTeams.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <div className="text-6xl mb-4">📊</div>
                            <p className="text-lg">No team scores recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Round2AdminDashboard;