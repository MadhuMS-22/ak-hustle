import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import round3Service from '../services/round3Service';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [teams, setTeams] = useState([]);
    const [stats, setStats] = useState({
        totalTeams: 0,
        registeredTeams: 0,
        round1Completed: 0,
        round2Completed: 0,
        round3Completed: 0
    });
    const [roundCodes, setRoundCodes] = useState({
        round2: '',
        round3: ''
    });
    const [roundCodeStats, setRoundCodeStats] = useState({
        round2: { usageCount: 0, completionCount: 0 },
        round3: { usageCount: 0, completionCount: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Round 3 specific state
    const [round3Teams, setRound3Teams] = useState([]);
    const [editingScore, setEditingScore] = useState(null);
    const [newScore, setNewScore] = useState('');
    const [updating, setUpdating] = useState(false);

    // Fetch teams and statistics
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch teams from admin endpoint
            const teamsResponse = await apiService.get('/admin/teams');
            setTeams(teamsResponse.data.teams || []);

            // Fetch competition stats and round codes from admin endpoint
            const statsResponse = await apiService.get('/admin/stats');
            setStats(statsResponse.data.stats);
            setRoundCodes(statsResponse.data.roundCodes);

            // Fetch round code statistics
            const codesResponse = await apiService.get('/admin/round-codes');
            if (codesResponse.data.roundCodes.round2) {
                setRoundCodeStats(prev => ({
                    ...prev,
                    round2: {
                        usageCount: codesResponse.data.roundCodes.round2.usageCount,
                        completionCount: codesResponse.data.roundCodes.round2.completionCount
                    }
                }));
            }
            if (codesResponse.data.roundCodes.round3) {
                setRoundCodeStats(prev => ({
                    ...prev,
                    round3: {
                        usageCount: codesResponse.data.roundCodes.round3.usageCount,
                        completionCount: codesResponse.data.roundCodes.round3.completionCount
                    }
                }));
            }

            // Fetch Round 3 results
            await fetchRound3Results();
        } catch (error) {
            console.error('Error fetching data:', error);
            // For demo purposes, use mock data
            setTeams([
                {
                    _id: "64a1b2c3d4e5f6789012345a",
                    teamName: "Team Alpha",
                    members: {
                        member1: { name: "John Doe", email: "john@example.com" },
                        member2: { name: "Jane Smith", email: "jane@example.com" }
                    },
                    leader: "member1",
                    leaderPhone: "+1234567890",
                    competitionStatus: "registered",
                    scores: { round1: 85, round2: 0, round3: 0, total: 85 },
                    isActive: true,
                    registrationDate: new Date('2024-01-15T10:30:00Z'),
                    lastLogin: new Date('2024-01-20T14:22:00Z')
                },
                {
                    _id: "64a1b2c3d4e5f6789012345b",
                    teamName: "Team Beta",
                    members: {
                        member1: { name: "Alice Johnson", email: "alice@example.com" },
                        member2: { name: "Bob Wilson", email: "bob@example.com" }
                    },
                    leader: "member2",
                    leaderPhone: "+1234567891",
                    competitionStatus: "round1_completed",
                    scores: { round1: 92, round2: 0, round3: 0, total: 92 },
                    isActive: true,
                    registrationDate: new Date('2024-01-16T09:15:00Z'),
                    lastLogin: new Date('2024-01-21T16:45:00Z')
                },
                {
                    _id: "64a1b2c3d4e5f6789012345c",
                    teamName: "Team Gamma",
                    members: {
                        member1: { name: "Charlie Brown", email: "charlie@example.com" },
                        member2: { name: "Diana Prince", email: "diana@example.com" }
                    },
                    leader: "member1",
                    leaderPhone: "+1234567892",
                    competitionStatus: "round2_completed",
                    scores: { round1: 78, round2: 88, round3: 0, total: 166 },
                    isActive: true,
                    registrationDate: new Date('2024-01-17T11:20:00Z'),
                    lastLogin: new Date('2024-01-22T13:30:00Z')
                },
                {
                    _id: "64a1b2c3d4e5f6789012345d",
                    teamName: "Team Delta",
                    members: {
                        member1: { name: "Eve Adams", email: "eve@example.com" },
                        member2: { name: "Frank Miller", email: "frank@example.com" }
                    },
                    leader: "member2",
                    leaderPhone: "+1234567893",
                    competitionStatus: "round3_completed",
                    scores: { round1: 90, round2: 95, round3: 88, total: 273 },
                    isActive: true,
                    registrationDate: new Date('2024-01-18T08:45:00Z'),
                    lastLogin: new Date('2024-01-23T15:20:00Z')
                },
                {
                    _id: "64a1b2c3d4e5f6789012345e",
                    teamName: "Team Echo",
                    members: {
                        member1: { name: "Grace Lee", email: "grace@example.com" },
                        member2: { name: "Henry Kim", email: "henry@example.com" }
                    },
                    leader: "member1",
                    leaderPhone: "+1234567894",
                    competitionStatus: "disqualified",
                    scores: { round1: 45, round2: 0, round3: 0, total: 45 },
                    isActive: false,
                    registrationDate: new Date('2024-01-19T12:10:00Z'),
                    lastLogin: new Date('2024-01-24T10:15:00Z')
                }
            ]);
            setStats({
                totalTeams: 5,
                registeredTeams: 1,
                round1Completed: 4,
                round2Completed: 2,
                round3Completed: 1
            });
            setRoundCodes({
                round2: 'CODE123',
                round3: 'FINAL456'
            });
            setRoundCodeStats({
                round2: { usageCount: 5, completionCount: 3 },
                round3: { usageCount: 2, completionCount: 1 }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('hustle_token');
        navigate('/login');
    };

    const handleAnnounceRound1 = async () => {
        try {
            const response = await apiService.post('/admin/announce/1');
            alert(response.message || 'Round 1 results announced!');
        } catch (error) {
            console.error('Error announcing round 1 results:', error);
            alert('Error announcing round 1 results');
        }
    };

    const handleAnnounceRound = async (roundNumber) => {
        try {
            const response = await apiService.post(`/admin/announce/${roundNumber}`);
            alert(response.message || `Round ${roundNumber} results announced!`);
        } catch (error) {
            console.error(`Error announcing round ${roundNumber} results:`, error);
            alert(`Error announcing round ${roundNumber} results`);
        }
    };

    const handleStartRound2 = async () => {
        try {
            if (!roundCodes.round2) {
                alert('Please enter Round 2 code');
                return;
            }
            const response = await apiService.post('/admin/start/2', { code: roundCodes.round2 });
            alert(response.message || `Round 2 started with code: ${roundCodes.round2}`);
        } catch (error) {
            console.error('Error starting round 2:', error);
            alert('Error starting round 2');
        }
    };

    const handleStartRound3 = async () => {
        try {
            if (!roundCodes.round3) {
                alert('Please enter Round 3 code');
                return;
            }
            const response = await apiService.post('/admin/start/3', { code: roundCodes.round3 });
            alert(response.message || `Round 3 started with code: ${roundCodes.round3}`);
        } catch (error) {
            console.error('Error starting round 3:', error);
            alert('Error starting round 3');
        }
    };

    const updateTeamStatus = async (teamId, type, status) => {
        try {
            const response = await apiService.put(`/admin/teams/${teamId}/status`, {
                competitionStatus: status
            });

            // Update local state
            const updatedTeams = teams.map(team =>
                team._id === teamId
                    ? { ...team, competitionStatus: status }
                    : team
            );
            setTeams(updatedTeams);

            // Refresh data to get updated statistics
            await fetchData();

            alert('Team status updated successfully');
        } catch (error) {
            console.error('Error updating team status:', error);
            alert('Error updating team status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'registered':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'round1_completed':
                return 'bg-blue-500/20 text-blue-300';
            case 'round2_completed':
                return 'bg-green-500/20 text-green-300';
            case 'round3_completed':
                return 'bg-purple-500/20 text-purple-300';
            case 'disqualified':
                return 'bg-red-500/20 text-red-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'registered':
                return 'REGISTERED';
            case 'round1_completed':
                return 'ROUND 1 COMPLETE';
            case 'round2_completed':
                return 'ROUND 2 COMPLETE';
            case 'round3_completed':
                return 'ROUND 3 COMPLETE';
            case 'disqualified':
                return 'DISQUALIFIED';
            default:
                return 'UNKNOWN';
        }
    };

    const getRoundStatus = (team, roundNumber) => {
        const status = team.competitionStatus;
        switch (roundNumber) {
            case 1:
                if (status === 'registered') return 'registered';
                if (status === 'round1_completed' || status === 'round2_completed' || status === 'round3_completed') return 'qualified';
                if (status === 'disqualified') return 'disqualified';
                return 'registered';
            case 2:
                if (status === 'registered' || status === 'round1_completed') return 'registered';
                if (status === 'round2_completed' || status === 'round3_completed') return 'qualified';
                if (status === 'disqualified') return 'disqualified';
                return 'registered';
            case 3:
                if (status === 'registered' || status === 'round1_completed' || status === 'round2_completed') return 'registered';
                if (status === 'round3_completed') return 'qualified';
                if (status === 'disqualified') return 'disqualified';
                return 'registered';
            default:
                return 'registered';
        }
    };

    const handleRoundQualification = async (teamId, roundNumber, qualification) => {
        try {
            let newStatus;

            if (qualification === 'disqualified') {
                newStatus = 'disqualified';
            } else if (qualification === 'qualified') {
                switch (roundNumber) {
                    case 1:
                        newStatus = 'round1_completed';
                        break;
                    case 2:
                        newStatus = 'round2_completed';
                        break;
                    case 3:
                        newStatus = 'round3_completed';
                        break;
                    default:
                        newStatus = 'registered';
                }
            } else {
                newStatus = 'registered';
            }

            await updateTeamStatus(teamId, 'status', newStatus);
        } catch (error) {
            console.error('Error updating round qualification:', error);
            alert('Error updating round qualification');
        }
    };

    // Round 3 specific functions
    const fetchRound3Results = async () => {
        try {
            const response = await round3Service.fetchRound3Results();
            setRound3Teams(response.data.teams || []);
        } catch (error) {
            console.error('Error fetching Round 3 results:', error);
            // Use mock data for demo
            setRound3Teams([
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
            setRound3Teams(round3Teams.map(team =>
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

    const renderDashboard = () => (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-lg text-gray-300">Manage competition rounds and monitor team progress</p>
            </div>

            {/* Total Teams Count */}
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 shadow-xl mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Total Teams Registered</h3>
                        <p className="text-gray-300">All competition participants</p>
                    </div>
                    <div className="text-right">
                        <p className="text-5xl font-bold text-white">{stats.totalTeams}</p>
                        <p className="text-blue-300 text-sm">Active Teams</p>
                    </div>
                </div>
            </div>

            {/* Round Result Announcements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Round 1 Results Announcement */}
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 shadow-xl">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">Round 1 Results</h3>
                        <p className="text-gray-300 text-sm">Aptitude Test</p>
                    </div>
                    <button
                        onClick={handleAnnounceRound1}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg"
                    >
                        Announce Round 1 Results
                    </button>
                </div>

                {/* Round 2 Results Announcement */}
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 shadow-xl">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">Round 2 Results</h3>
                        <p className="text-gray-300 text-sm">Coding Challenge</p>
                    </div>
                    <button
                        onClick={() => handleAnnounceRound(2)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg"
                    >
                        Announce Round 2 Results
                    </button>
                </div>

                {/* Round 3 Results Announcement */}
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 shadow-xl">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">Round 3 Results</h3>
                        <p className="text-gray-300 text-sm">Final Challenge</p>
                    </div>
                    <button
                        onClick={() => handleAnnounceRound(3)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg"
                    >
                        Announce Round 3 Results
                    </button>
                </div>
            </div>

            {/* Round Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Round 2 Management */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white">Round 2 Management</h3>
                        <p className="text-gray-300">Coding Challenge</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Access Code</label>
                            <input
                                type="text"
                                placeholder="Enter round 2 code"
                                value={roundCodes.round2 || ''}
                                onChange={(e) => setRoundCodes({ ...roundCodes, round2: e.target.value })}
                                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={handleStartRound2}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg"
                        >
                            Start Round 2
                        </button>
                    </div>
                </div>

                {/* Round 3 Management */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white">Round 3 Management</h3>
                        <p className="text-gray-300">Final Challenge</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Access Code</label>
                            <input
                                type="text"
                                placeholder="Enter round 3 code"
                                value={roundCodes.round3 || ''}
                                onChange={(e) => setRoundCodes({ ...roundCodes, round3: e.target.value })}
                                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <button
                            onClick={handleStartRound3}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg"
                        >
                            Start Round 3
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );

    const renderTeamManagement = () => (
        <div className="p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Team Management
                </h1>
                <p className="text-lg text-gray-300">Manage registered teams and their competition status</p>
            </div>

            {/* Round Count Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Total Teams</p>
                    <p className="text-3xl font-bold text-white">{teams.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Round 1 Qualified</p>
                    <p className="text-3xl font-bold text-white">{teams.filter(t => t.competitionStatus === 'round1_completed' || t.competitionStatus === 'round2_completed' || t.competitionStatus === 'round3_completed').length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Round 2 Qualified</p>
                    <p className="text-3xl font-bold text-white">{teams.filter(t => t.competitionStatus === 'round2_completed' || t.competitionStatus === 'round3_completed').length}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Round 3 Qualified</p>
                    <p className="text-3xl font-bold text-white">{teams.filter(t => t.competitionStatus === 'round3_completed').length}</p>
                </div>
            </div>


            {/* Search and Filter */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Search Teams</label>
                        <input
                            type="text"
                            placeholder="Search by team name or member name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Filter by Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Teams</option>
                            <option value="registered">Registered</option>
                            <option value="round1_completed">Round 1 Complete</option>
                            <option value="round2_completed">Round 2 Complete</option>
                            <option value="round3_completed">Round 3 Complete</option>
                            <option value="disqualified">Disqualified</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Teams Table */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-white font-semibold">Team Name</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Score</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Round 1</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Round 2</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Round 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams
                                .filter(team => {
                                    const matchesSearch = searchTerm === '' ||
                                        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        team.members?.member1?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        team.members?.member2?.name.toLowerCase().includes(searchTerm.toLowerCase());

                                    const matchesStatus = statusFilter === 'all' || team.competitionStatus === statusFilter;

                                    return matchesSearch && matchesStatus;
                                })
                                .map((team, index) => (
                                    <tr key={team._id} className="border-t border-white/20 hover:bg-white/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-semibold text-lg">{team.teamName}</p>
                                                <p className="text-gray-300 text-sm">ID: {team._id?.slice(-8)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.competitionStatus)}`}>
                                                {getStatusText(team.competitionStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-center">
                                                <p className="text-white font-bold text-xl">{team.scores?.total || 0}</p>
                                                <div className="flex justify-center space-x-2 text-xs text-gray-300">
                                                    <span>R1: {team.scores?.round1 || 0}</span>
                                                    <span>R2: {team.scores?.round2 || 0}</span>
                                                    <span>R3: {team.scores?.round3 || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={getRoundStatus(team, 1)}
                                                onChange={(e) => handleRoundQualification(team._id, 1, e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700 transition-colors"
                                            >
                                                <option value="registered" className="bg-gray-800 text-white">Registered</option>
                                                <option value="qualified" className="bg-gray-800 text-white">Qualified</option>
                                                <option value="disqualified" className="bg-gray-800 text-white">Disqualified</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={getRoundStatus(team, 2)}
                                                onChange={(e) => handleRoundQualification(team._id, 2, e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${getRoundStatus(team, 1) !== 'qualified'
                                                    ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-green-500'
                                                    }`}
                                                disabled={getRoundStatus(team, 1) !== 'qualified'}
                                            >
                                                <option value="registered" className="bg-gray-800 text-white">Registered</option>
                                                <option value="qualified" className="bg-gray-800 text-white">Qualified</option>
                                                <option value="disqualified" className="bg-gray-800 text-white">Disqualified</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={getRoundStatus(team, 3)}
                                                onChange={(e) => handleRoundQualification(team._id, 3, e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${getRoundStatus(team, 2) !== 'qualified'
                                                    ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 focus:ring-purple-500'
                                                    }`}
                                                disabled={getRoundStatus(team, 2) !== 'qualified'}
                                            >
                                                <option value="registered" className="bg-gray-800 text-white">Registered</option>
                                                <option value="qualified" className="bg-gray-800 text-white">Qualified</option>
                                                <option value="disqualified" className="bg-gray-800 text-white">Disqualified</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* No teams found message */}
                {teams.filter(team => {
                    const matchesSearch = searchTerm === '' ||
                        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        team.members?.member1?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        team.members?.member2?.name.toLowerCase().includes(searchTerm.toLowerCase());

                    const matchesStatus = statusFilter === 'all' || team.competitionStatus === statusFilter;

                    return matchesSearch && matchesStatus;
                }).length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg mb-2">No teams found</div>
                            <div className="text-gray-500 text-sm">
                                {searchTerm ? `No teams match "${searchTerm}"` : 'No teams match the selected filter'}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );

    const renderRound2Results = () => {
        const round2Teams = teams.filter(team =>
            team.competitionStatus === 'round2_completed' || team.competitionStatus === 'round3_completed'
        ).sort((a, b) => (b.scores?.round2 || 0) - (a.scores?.round2 || 0));

        return (
            <div className="p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        Round 2 Results
                    </h1>
                    <p className="text-lg text-gray-300">Coding Challenge Results and Leaderboard</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-white font-semibold">Rank</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Team Name</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Round 2 Score</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Total Score</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {round2Teams.map((team, index) => (
                                <tr key={team._id} className="border-t border-white/20 hover:bg-white/10 transition-colors">
                                    <td className="px-6 py-4 text-white font-bold">#{index + 1}</td>
                                    <td className="px-6 py-4 text-white font-medium">{team.teamName}</td>
                                    <td className="px-6 py-4 text-white">{team.scores?.round2 || 0}</td>
                                    <td className="px-6 py-4 text-white font-bold">{team.scores?.total || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${team.competitionStatus === 'round2_completed' ? 'bg-green-500/20 text-green-300' :
                                            team.competitionStatus === 'round3_completed' ? 'bg-purple-500/20 text-purple-300' :
                                                'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                            {team.competitionStatus.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderRound3Results = () => {
        return (
            <div className="p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        Round 3 Admin Dashboard
                    </h1>
                    <p className="text-lg text-gray-300">Manage Round 3 results and scores</p>
                </div>

                {/* Round 3 Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Total Submissions</h3>
                        <p className="text-4xl font-bold text-white">{round3Teams.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Average Score</h3>
                        <p className="text-4xl font-bold text-white">
                            {round3Teams.length > 0
                                ? Math.round(round3Teams.reduce((sum, team) => sum + team.round3Score, 0) / round3Teams.length)
                                : 0
                            }
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Highest Score</h3>
                        <p className="text-4xl font-bold text-white">
                            {round3Teams.length > 0 ? Math.max(...round3Teams.map(team => team.round3Score)) : 0}
                        </p>
                    </div>
                </div>

                {/* Round 3 Results Table */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/20">
                        <h2 className="text-xl font-semibold text-white">Round 3 Results</h2>
                    </div>

                    {round3Teams.length === 0 ? (
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
                                    {round3Teams.map((team, index) => (
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
                                                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'team-management':
                return renderTeamManagement();
            case 'round2':
                return renderRound2Results();
            case 'round3':
                return renderRound3Results();
            default:
                return renderDashboard();
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex">
            {/* Sidebar */}
            <div className="w-64 bg-white/20 backdrop-blur-sm border-r border-white/30 shadow-lg">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white text-center mb-8">Admin</h1>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-8"
                    >
                        Logout
                    </button>
                </div>

                <nav className="px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard'
                            ? 'bg-white/30 text-white font-semibold'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                            </svg>
                            Dashboard
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('team-management')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'team-management'
                            ? 'bg-white/30 text-white font-semibold'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Team Management
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('round2')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'round2'
                            ? 'bg-white/30 text-white font-semibold'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Round 2
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('round3')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'round3'
                            ? 'bg-white/30 text-white font-semibold'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Round 3
                        </div>
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPage;