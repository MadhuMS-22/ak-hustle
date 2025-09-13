import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import round3Service from '../../services/round3Service';

const Round3AdminPage = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingScore, setEditingScore] = useState(null);
    const [newScore, setNewScore] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showPrograms, setShowPrograms] = useState(false);
    const [error, setError] = useState(null);

    // Maximum possible score (calculated from questions - 36 puzzle blocks total)
    const maxPossibleScore = 36;

    useEffect(() => {
        fetchRound3Results();
    }, []);

    const fetchRound3Results = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await round3Service.fetchRound3Results();

            // Sort teams by: 1) Score (highest first), 2) Time (fastest first)
            const sortedTeams = (response.data.teams || []).sort((a, b) => {
                // Primary sort: Score (highest first)
                if (b.round3Score !== a.round3Score) {
                    return (b.round3Score || 0) - (a.round3Score || 0);
                }
                // Secondary sort: Time (fastest first)
                return (a.round3Time || 0) - (b.round3Time || 0);
            });

            setTeams(sortedTeams);
        } catch (error) {
            console.error('Error fetching Round 3 results:', error);
            setError(error.message);
            // For demo purposes, use mock data
            setTeams([
                {
                    _id: '1',
                    teamName: 'Team Alpha',
                    members: { member1: { name: 'John Doe' }, member2: { name: 'Jane Smith' } },
                    leader: 'member1',
                    round3Score: 85,
                    round3Time: 1200,
                    round3SubmittedAt: new Date().toISOString(),
                    round3QuestionOrderName: 'Order A',
                    round3Program: 'Python',
                    round3QuestionResults: [
                        { questionIndex: 0, blockIndex: 0, selectedAnswer: 'printf("Hello");', isCorrect: true },
                        { questionIndex: 0, blockIndex: 1, selectedAnswer: 'return 0;', isCorrect: true }
                    ],
                    round3IndividualScores: [
                        { questionIndex: 0, score: 2, timeTaken: 120 },
                        { questionIndex: 1, score: 1, timeTaken: 180 }
                    ]
                },
                {
                    _id: '2',
                    teamName: 'Team Beta',
                    members: { member1: { name: 'Alice Johnson' }, member2: { name: 'Bob Wilson' } },
                    leader: 'member2',
                    round3Score: 92,
                    round3Time: 980,
                    round3SubmittedAt: new Date().toISOString(),
                    round3QuestionOrderName: 'Order B',
                    round3Program: 'Java',
                    round3QuestionResults: [
                        { questionIndex: 0, blockIndex: 0, selectedAnswer: 'System.out.println("Hello");', isCorrect: true },
                        { questionIndex: 0, blockIndex: 1, selectedAnswer: 'return 0;', isCorrect: true }
                    ],
                    round3IndividualScores: [
                        { questionIndex: 0, score: 2, timeTaken: 100 },
                        { questionIndex: 1, score: 2, timeTaken: 150 }
                    ]
                },
                {
                    _id: '3',
                    teamName: 'Team Gamma',
                    members: { member1: { name: 'Charlie Brown' }, member2: { name: 'Diana Prince' } },
                    leader: 'member1',
                    round3Score: 78,
                    round3Time: 1350,
                    round3SubmittedAt: new Date().toISOString(),
                    round3QuestionOrderName: 'Order C',
                    round3Program: 'C++',
                    round3QuestionResults: [
                        { questionIndex: 0, blockIndex: 0, selectedAnswer: 'cout << "Hello";', isCorrect: true },
                        { questionIndex: 0, blockIndex: 1, selectedAnswer: 'return 0;', isCorrect: false }
                    ],
                    round3IndividualScores: [
                        { questionIndex: 0, score: 1, timeTaken: 200 },
                        { questionIndex: 1, score: 1, timeTaken: 250 }
                    ]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditScore = (teamId, currentScore) => {
        setEditingScore(teamId);
        setNewScore(currentScore.toString());
    };

    const handleCancelEdit = () => {
        setEditingScore(null);
        setNewScore('');
    };

    const handleViewPrograms = (team) => {
        console.log('Viewing programs for team:', team.teamName);
        console.log('Round 3 Question Results:', team.round3QuestionResults);
        console.log('Round 3 Individual Scores:', team.round3IndividualScores);
        setSelectedTeam(team);
        setShowPrograms(true);
    };

    const handleBackToList = () => {
        setShowPrograms(false);
        setSelectedTeam(null);
    };

    const handleUpdateScore = async (teamId) => {
        if (!newScore || isNaN(newScore) || newScore < 0) {
            alert('Please enter a valid score');
            return;
        }

        try {
            setUpdating(true);
            await round3Service.setRound3Score(teamId, parseInt(newScore));

            // Update local state
            setTeams(teams.map(team =>
                team._id === teamId
                    ? { ...team, round3Score: parseInt(newScore) }
                    : team
            ));

            setEditingScore(null);
            setNewScore('');
            alert('Score updated successfully!');
        } catch (error) {
            console.error('Error updating score:', error);
            alert('Error updating score');
        } finally {
            setUpdating(false);
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

    const getLeaderName = (team) => {
        return team.leader === 'member1'
            ? team.members.member1.name
            : team.members.member2.name;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100 font-sans p-4 flex flex-col items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    Loading Round 3 Results...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100 font-sans p-4 flex flex-col items-center justify-center">
                <div className="text-center text-red-500">
                    <h2 className="text-2xl font-bold mb-4">Error Loading Admin Page</h2>
                    <p className="mb-4">Error: {error}</p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-full transition duration-500 transform hover:scale-105 shadow-xl glow-purple"
                    >
                        Back to Admin
                    </button>
                </div>
            </div>
        );
    }

    if (showPrograms && selectedTeam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100 font-sans p-4 flex flex-col items-center">
                <div className="w-full max-w-6xl p-8 glass-dark rounded-xl shadow-2xl mt-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                        {selectedTeam.teamName} - All Programs
                    </h1>

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full mb-4">
                            <span className="text-purple-400 font-semibold">Question Order:</span>
                            <span className="text-white font-bold">{selectedTeam.round3QuestionOrderName || 'Unknown'}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-full">
                            <span className="text-blue-400 font-semibold">Programming Language:</span>
                            <span className="text-white font-bold">{selectedTeam.round3Program || 'Unknown'}</span>
                        </div>
                    </div>

                    {/* Overall Program Summary */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-400">Complete Program Summary</h2>
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-gray-400 font-semibold">FULL PROGRAM CODE:</span>
                                <div className="flex-1 h-px bg-gray-600"></div>
                            </div>
                            <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed text-gray-200 bg-gray-900 p-4 rounded">
                                {(() => {
                                    console.log('Rendering complete program summary...');
                                    console.log('Question results:', selectedTeam.round3QuestionResults);

                                    if (selectedTeam.round3QuestionResults && selectedTeam.round3QuestionResults.length > 0) {
                                        const sortedResults = selectedTeam.round3QuestionResults
                                            .sort((a, b) => a.questionIndex - b.questionIndex || a.blockIndex - b.blockIndex);
                                        console.log('Sorted results:', sortedResults);

                                        const programCode = sortedResults.map(result => result.selectedAnswer).join('\n');
                                        console.log('Generated program code:', programCode);
                                        return programCode;
                                    } else {
                                        console.log('No question results available');
                                        return 'No program data available';
                                    }
                                })()}
                            </pre>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-400">Program by Question</h2>
                        <div className="space-y-8">
                            {(() => {
                                // Group question results by question index
                                const questionGroups = {};
                                console.log('Processing question results:', selectedTeam.round3QuestionResults);

                                if (selectedTeam.round3QuestionResults && selectedTeam.round3QuestionResults.length > 0) {
                                    selectedTeam.round3QuestionResults.forEach(result => {
                                        if (!questionGroups[result.questionIndex]) {
                                            questionGroups[result.questionIndex] = [];
                                        }
                                        questionGroups[result.questionIndex].push(result);
                                    });
                                }

                                console.log('Question groups:', questionGroups);

                                return Object.keys(questionGroups).length > 0 ? (
                                    Object.keys(questionGroups).map(questionIndex => {
                                        const questionResults = questionGroups[questionIndex];
                                        const questionScore = selectedTeam.round3IndividualScores?.find(q => q.questionIndex === parseInt(questionIndex));
                                        const hasErrors = questionResults.some(result => !result.isCorrect);
                                        const totalBlocks = questionResults.length;
                                        const correctBlocks = questionResults.filter(result => result.isCorrect).length;

                                        return (
                                            <div key={questionIndex} className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-indigo-400 mb-2">
                                                            Question {parseInt(questionIndex) + 1}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span className="text-green-400">
                                                                Score: {questionScore?.score || 0} points
                                                            </span>
                                                            <span className="text-yellow-400">
                                                                Time: {questionScore?.timeTaken || 0}s
                                                            </span>
                                                            <span className="text-blue-400">
                                                                Blocks: {correctBlocks}/{totalBlocks} correct
                                                            </span>
                                                            {hasErrors && (
                                                                <span className="text-red-400 flex items-center gap-1">
                                                                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                                                    Has Errors
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${correctBlocks === totalBlocks ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'}`}>
                                                            {correctBlocks === totalBlocks ? 'Perfect' : 'Partial'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-900 p-4 rounded-lg border-l-4 border-indigo-500">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-xs text-gray-400 font-semibold">COMPLETE PROGRAM CODE:</span>
                                                        <div className="flex-1 h-px bg-gray-600"></div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 bg-green-500 rounded"></div>
                                                                <span className="text-green-400">Correct</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 bg-red-500 rounded"></div>
                                                                <span className="text-red-400">Incorrect</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(() => {
                                                            console.log(`Rendering question ${questionIndex} with ${questionResults.length} blocks`);
                                                            const sortedResults = questionResults.sort((a, b) => a.blockIndex - b.blockIndex);
                                                            console.log('Sorted question results:', sortedResults);

                                                            return sortedResults.map((result, blockIndex) => {
                                                                console.log(`Rendering block ${blockIndex}:`, result);
                                                                return (
                                                                    <div key={blockIndex} className={`p-3 rounded ${result.isCorrect ? 'bg-green-900/30 border-l-2 border-green-500' : 'bg-red-900/30 border-l-2 border-red-500'}`}>
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-xs text-gray-400 font-semibold">
                                                                                Block {result.blockIndex + 1}
                                                                            </span>
                                                                            <div className="flex items-center gap-2">
                                                                                {result.isCorrect ? (
                                                                                    <span className="text-green-400 text-xs">✅ Correct</span>
                                                                                ) : (
                                                                                    <span className="text-red-400 text-xs">❌ Incorrect</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                                                            <span className={result.isCorrect ? 'text-green-300' : 'text-red-300'}>
                                                                                {result.selectedAnswer}
                                                                            </span>
                                                                        </pre>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>

                                                    {/* Complete Program Summary */}
                                                    <div className="mt-4 p-3 bg-gray-800 rounded border-t border-gray-600">
                                                        <div className="text-xs text-gray-400 font-semibold mb-2">COMPLETE PROGRAM:</div>
                                                        <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed text-gray-200">
                                                            {(() => {
                                                                const sortedResults = questionResults.sort((a, b) => a.blockIndex - b.blockIndex);
                                                                const programCode = sortedResults.map(result => result.selectedAnswer).join('\n');
                                                                console.log(`Complete program for question ${questionIndex}:`, programCode);
                                                                return programCode;
                                                            })()}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center text-gray-400 py-4">
                                        No program data available
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-400">Individual Question Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedTeam.round3IndividualScores && selectedTeam.round3IndividualScores.length > 0 ? (
                                selectedTeam.round3IndividualScores.map((qScore, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                        <h3 className="font-bold text-indigo-400">Question {(qScore.questionIndex || index) + 1}</h3>
                                        <p className="text-green-400">Score: {qScore.score || 0}</p>
                                        <p className="text-yellow-400">Time: {qScore.timeTaken || 0}s</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-gray-400 py-4">
                                    No individual question results available
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleBackToList}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                        >
                            Back to Teams
                        </button>
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 flex flex-col items-center">
            <div className="w-full max-w-7xl p-8 bg-gray-800 rounded-xl shadow-lg mt-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 text-indigo-400">
                    Round 3 Admin Dashboard
                </h1>
                <p className="text-center mb-8 text-gray-300">
                    Team Results and Scores
                </p>

                {teams && teams.length > 0 ? (
                    <div className="space-y-6">
                        {teams.map((team, index) => {
                            const rank = index + 1;
                            const questionsSolved = (team.round3IndividualScores || []).filter(q => q.score > 0).length;
                            const percentage = Math.round(((team.round3Score || 0) / maxPossibleScore) * 100);

                            return (
                                <div key={team._id || index} className="bg-gray-700 rounded-lg p-6 relative">
                                    {/* Ranking Badge */}
                                    <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
                                        #{rank}
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="ml-4">
                                            <h2 className="text-2xl font-bold text-indigo-400">{team.teamName || 'Unknown Team'}</h2>
                                            <p className="text-gray-300">Leader: {getLeaderName(team)}</p>
                                            <p className="text-gray-300">Submitted: {team.round3SubmittedAt ? new Date(team.round3SubmittedAt).toLocaleString() : 'Unknown'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${(team.round3Score || 0) === maxPossibleScore ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'}`}>
                                                    {(team.round3Score || 0) === maxPossibleScore ? 'Complete' : 'Partial'}
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {team.round3Score || 0}/{maxPossibleScore} points ({percentage}%)
                                                </span>
                                                <span className="text-sm text-blue-400">
                                                    {questionsSolved}/5 questions solved
                                                </span>
                                                <span className="text-sm text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                                                    Order: {team.round3QuestionOrderName || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-green-400">Score: {team.round3Score || 0}</p>
                                            <p className="text-lg text-yellow-400">Time: {formatTime(team.round3Time || 0)}</p>
                                            <p className="text-sm text-gray-400">Rank #{rank}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-blue-400 mb-2">Individual Question Scores:</h3>
                                        <div className="grid grid-cols-5 gap-2">
                                            {team.round3IndividualScores && team.round3IndividualScores.length > 0 ? (
                                                team.round3IndividualScores.map((qScore, qIndex) => (
                                                    <div key={qIndex} className="bg-gray-600 p-2 rounded text-center">
                                                        <div className="text-sm text-gray-300">Q{(qScore.questionIndex || qIndex) + 1}</div>
                                                        <div className="font-bold text-green-400">{qScore.score || 0}</div>
                                                        <div className="text-xs text-yellow-400">{qScore.timeTaken || 0}s</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-5 text-center text-gray-400 py-4">
                                                    No individual question scores available
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            {editingScore === team._id ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        value={newScore}
                                                        onChange={(e) => setNewScore(e.target.value)}
                                                        className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateScore(team._id)}
                                                        disabled={updating}
                                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs px-2 py-1 rounded transition-colors"
                                                    >
                                                        {updating ? '...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditScore(team._id, team.round3Score)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors"
                                                >
                                                    Edit Score
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleViewPrograms(team)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                                        >
                                            View All Programs
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-xl">No team scores recorded yet.</p>
                    </div>
                )}

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                    >
                        Back to Admin
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Round3AdminPage;
