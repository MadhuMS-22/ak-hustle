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
            // Update the team in the list with submissions data
            setRound2Data(prev => ({
                ...prev,
                teams: prev.teams.map(team =>
                    team._id === teamId
                        ? { ...team, submissions: response.data.submissions }
                        : team
                )
            }));
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

    // Download team answers as PDF
    const downloadTeamAnswers = (team, submissions) => {
        // Ensure we only get the latest submission for each challenge type
        const latestSubmissions = ['debug', 'trace', 'program'].map(challengeType => {
            const challengeSubmissions = submissions.filter(sub => sub.challengeType === challengeType);
            return challengeSubmissions.sort((a, b) => {
                if (a.attemptNumber !== b.attemptNumber) {
                    return b.attemptNumber - a.attemptNumber;
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            })[0];
        }).filter(Boolean);
        try {
            // Create a new window for PDF generation
            const printWindow = window.open('', '_blank');

            // Prepare the content
            const content = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${team.teamName} - Round 2 Answers</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; background: white; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                        .team-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                        .question { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
                        .question-header { background: #e9ecef; padding: 10px; margin: -20px -20px 15px -20px; border-radius: 8px 8px 0 0; }
                        .code-block { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; margin: 10px 0; font-family: 'Courier New', monospace; white-space: pre-wrap; }
                        .score { font-weight: bold; color: #28a745; }
                        .incorrect { color: #dc3545; }
                        .correct { color: #28a745; }
                        .meta-info { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Round 2 - Team Answers Report</h1>
                        <h2>${team.teamName}</h2>
                    </div>
                    
                    <div class="team-info">
                        <h3>Team Information</h3>
                        <p><strong>Team Name:</strong> ${team.teamName}</p>
                        <p><strong>Leader:</strong> ${getLeaderName(team)}</p>
                        <p><strong>Total Score:</strong> <span class="score">${team.totalScore}</span></p>
                        <p><strong>Total Time:</strong> ${formatTime(team.totalTimeTaken)}</p>
                        <p><strong>Status:</strong> ${team.isQuizCompleted ? 'Completed' : 'In Progress'}</p>
                    </div>
                    
                    <h3>Main Challenge Answers (3 Questions)</h3>
                    
                    ${latestSubmissions.map((submission, index) => `
                        <div class="question">
                            <div class="question-header">
                                <h4>Question ${index + 1}: ${submission.challengeType === 'debug' ? 'Debug' : submission.challengeType === 'trace' ? 'Output (Trace)' : 'Program'} Challenge</h4>
                                <p>Score: <span class="score">${submission.score}</span> | 
                                   Status: <span class="${submission.isCorrect ? 'correct' : 'incorrect'}">${submission.isCorrect ? 'Correct' : 'Incorrect'}</span></p>
                            </div>
                            
                            <div>
                                <h5>Original Question:</h5>
                                <div class="code-block">${submission.originalQuestion || 'No question data available'}</div>
                            </div>
                            
                            <div>
                                <h5>Team's Solution:</h5>
                                <div class="code-block">${submission.userSolution || 'No solution provided'}</div>
                            </div>
                            
                            <div class="meta-info">
                                <p>Time Taken: ${submission.timeTaken}s | Attempt: #${submission.attemptNumber} | Submitted: ${new Date(submission.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(content);
            printWindow.document.close();

            // Wait for content to load, then print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            };

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
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
                            // Get only the latest submission for each of the 3 main challenge types
                            const mainSubmissions = ['debug', 'trace', 'program'].map(challengeType => {
                                const submissions = teamSubmissions.filter(sub => sub.challengeType === challengeType);
                                // Return the latest submission (highest attempt number or most recent)
                                return submissions.sort((a, b) => {
                                    if (a.attemptNumber !== b.attemptNumber) {
                                        return b.attemptNumber - a.attemptNumber; // Higher attempt number first
                                    }
                                    return new Date(b.createdAt) - new Date(a.createdAt); // Most recent first
                                })[0];
                            }).filter(Boolean); // Remove undefined entries

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
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h4 className="text-white font-semibold text-lg">Team's 3 Main Answers:</h4>
                                                    <p className="text-gray-400 text-sm">Debug, Output (Trace), and Program challenges</p>
                                                </div>
                                                <button
                                                    onClick={() => downloadTeamAnswers(team, mainSubmissions)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download Answers
                                                </button>
                                            </div>
                                            {mainSubmissions.length > 0 ? (
                                                <div className="space-y-4">
                                                    {mainSubmissions.map((submission, subIndex) => {
                                                        const challengeOrder = ['debug', 'trace', 'program'];
                                                        const challengeNames = {
                                                            'debug': 'Debug Challenge',
                                                            'trace': 'Output (Trace) Challenge',
                                                            'program': 'Program Challenge'
                                                        };
                                                        return (
                                                            <div key={submission._id} className="bg-white/10 rounded-lg p-4">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <h5 className="text-white font-semibold text-lg">
                                                                        {subIndex + 1}. {challengeNames[submission.challengeType] || submission.challengeType.charAt(0).toUpperCase() + submission.challengeType.slice(1) + ' Challenge'}
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
                                                        );
                                                    })}
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