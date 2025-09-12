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

    useEffect(() => {
        fetchRound3Results();
    }, []);

    const fetchRound3Results = async () => {
        try {
            setLoading(true);
            const response = await round3Service.fetchRound3Results();
            setTeams(response.data.teams || []);
        } catch (error) {
            console.error('Error fetching Round 3 results:', error);
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
                    round3Program: 'Python'
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
                    round3Program: 'Java'
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
                    round3Program: 'C++'
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
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">Loading Round 3 Results...</div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
            {/* Header */}
            <div className="bg-white/20 backdrop-blur-sm border-b border-white/30 shadow-lg">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Round 3 Admin Dashboard</h1>
                            <p className="text-white/80 mt-2">Manage Round 3 results and scores</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Total Submissions</h3>
                        <p className="text-3xl font-bold text-white">{teams.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Average Score</h3>
                        <p className="text-3xl font-bold text-white">
                            {teams.length > 0
                                ? Math.round(teams.reduce((sum, team) => sum + team.round3Score, 0) / teams.length)
                                : 0
                            }
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-2">Highest Score</h3>
                        <p className="text-3xl font-bold text-white">
                            {teams.length > 0 ? Math.max(...teams.map(team => team.round3Score)) : 0}
                        </p>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/20">
                        <h2 className="text-xl font-semibold text-white">Round 3 Results</h2>
                    </div>

                    {teams.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-white/70 text-lg">No Round 3 submissions yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Rank</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Team Name</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Leader</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Score</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Time</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Program</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Submitted</th>
                                        <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team, index) => (
                                        <tr key={team._id} className="border-t border-white/20 hover:bg-white/10 transition-colors">
                                            <td className="px-6 py-4 text-white font-bold">#{index + 1}</td>
                                            <td className="px-6 py-4 text-white font-medium">{team.teamName}</td>
                                            <td className="px-6 py-4 text-white/80">{getLeaderName(team)}</td>
                                            <td className="px-6 py-4">
                                                {editingScore === team._id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="number"
                                                            value={newScore}
                                                            onChange={(e) => setNewScore(e.target.value)}
                                                            className="w-20 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-white font-bold">{team.round3Score}</span>
                                                        <button
                                                            onClick={() => handleEditScore(team._id, team.round3Score)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-white">{formatTime(team.round3Time)}</td>
                                            <td className="px-6 py-4 text-white/80">{team.round3Program}</td>
                                            <td className="px-6 py-4 text-white/80 text-sm">
                                                {formatDate(team.round3SubmittedAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => fetchRound3Results()}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded transition-colors"
                                                >
                                                    Refresh
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Round3AdminPage;
