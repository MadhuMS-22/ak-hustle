import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api'
import adminAuthService from '../services/adminAuthService';
import round3Service from '../services/round3Service';
import Round2AdminDashboard from '../components/Round2AdminDashboard';

const AdminPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [teams, setTeams] = useState([]);
    const [teamManagementData, setTeamManagementData] = useState({
        teams: [],
        stats: {
            totalTeams: 0,
            registered: 0,
            round1: 0,
            round2: 0,
            round3: 0,
            eliminated: 0,
            selected: 0,
            hasCompletedCycle: 0,
            resultsAnnounced: 0
        }
    });
    const [announcedRounds, setAnnouncedRounds] = useState({
        round1: false,
        round2: false,
        round3: false
    });
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
    const [newRoundCodes, setNewRoundCodes] = useState({ round2: '', round3: '' });
    const [settingCode, setSettingCode] = useState({ round2: false, round3: false });
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);

    // Helper function to make admin API calls
    const adminApiCall = async (endpoint, options = {}) => {
        // Check if admin is authenticated before making the request
        if (!adminAuthService.isAdminAuthenticated()) {
            throw new Error('Admin not authenticated. Please log in.');
        }

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
            // If authentication error, redirect to login
            if (response.status === 401 || data.message?.includes('Invalid token')) {
                navigate('/admin/login');
                return;
            }
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Round 3 specific state
    const [round3Teams, setRound3Teams] = useState([]);
    const [editingScore, setEditingScore] = useState(null);
    const [newScore, setNewScore] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showPrograms, setShowPrograms] = useState(false);
    const [round3Error, setRound3Error] = useState(null);
    const [round3Loading, setRound3Loading] = useState(false);

    // Team selection state
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [selectionLoading, setSelectionLoading] = useState(false);

    // Maximum possible score for Round 3 (calculated from questions - 36 puzzle blocks total)
    const maxPossibleScore = 36;

    // Admin authentication state
    const [adminData, setAdminData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication and fetch data
    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            // Check if admin is authenticated
            if (!adminAuthService.isAdminAuthenticated()) {
                navigate('/admin/login');
                return;
            }

            // Validate token with server
            const isValid = await adminAuthService.validateAdminToken();

            if (!isValid) {
                navigate('/admin/login');
                return;
            }

            // Load admin data
            const admin = adminAuthService.getAdminData();
            setAdminData(admin);
            setIsAuthenticated(true);

            // Fetch application data
            await fetchData();
        } catch (error) {
            console.error('Authentication check failed:', error);
            navigate('/admin/login');
        }
    };

    // Force refresh team management data when switching tabs
    useEffect(() => {
        if (activeTab === 'teamManagement' && isAuthenticated) {
            fetchTeamManagementData();
        }
    }, [activeTab, isAuthenticated]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Clear all cached data first
            setTeams([]);
            setStats({
                totalTeams: 0,
                registeredTeams: 0,
                round1Completed: 0,
                round2Completed: 0,
                round3Completed: 0
            });
            setTeamManagementData({
                teams: [],
                stats: {
                    totalTeams: 0,
                    registered: 0,
                    round1: 0,
                    round2: 0,
                    round3: 0,
                    eliminated: 0,
                    selected: 0,
                    hasCompletedCycle: 0,
                    resultsAnnounced: 0
                }
            });

            // Fetch teams from admin endpoint
            const teamsResponse = await adminApiCall('/admin/teams');
            console.log('Teams response:', teamsResponse);
            setTeams(teamsResponse.data.teams || []);

            // Fetch competition stats and round codes from admin endpoint
            const statsResponse = await adminApiCall('/admin/stats');
            console.log('Stats response:', statsResponse);
            setStats(statsResponse.data.stats);
            setRoundCodes(statsResponse.data.roundCodes);

            // Fetch round code statistics
            const codesResponse = await adminApiCall('/admin/round-codes');
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

            // Fetch team management data
            await fetchTeamManagementData();
        } catch (error) {
            console.error('Error fetching data:', error);
            // Show empty state instead of mock data
            setTeams([]);
            setStats({
                totalTeams: 0,
                registeredTeams: 0,
                round1Completed: 0,
                round2Completed: 0,
                round3Completed: 0
            });
            setTeamManagementData({
                teams: [],
                stats: {
                    totalTeams: 0,
                    registered: 0,
                    round1: 0,
                    round2: 0,
                    round3: 0,
                    eliminated: 0,
                    selected: 0,
                    hasCompletedCycle: 0,
                    resultsAnnounced: 0
                }
            });
        } finally {
            setLoading(false);
            setRound3Loading(false);
        }
    };


    const handleAnnounceRound1 = async () => {
        try {
            const response = await adminApiCall('/admin/announce/1', { method: 'POST' });
            alert(response.message || 'Round 1 results announced!');
        } catch (error) {
            console.error('Error announcing round 1 results:', error);
            alert('Error announcing round 1 results');
        }
    };


    const handleStartRound2 = async () => {
        try {
            if (!roundCodes.round2) {
                alert('Please enter Round 2 code');
                return;
            }
            const response = await adminApiCall('/admin/start/2', {
                method: 'POST',
                body: JSON.stringify({ code: roundCodes.round2 })
            });
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
            const response = await adminApiCall('/admin/start/3', {
                method: 'POST',
                body: JSON.stringify({ code: roundCodes.round3 })
            });
            alert(response.message || `Round 3 started with code: ${roundCodes.round3}`);
        } catch (error) {
            console.error('Error starting round 3:', error);
            alert('Error starting round 3');
        }
    };

    const handleSetCode = async (roundNumber) => {
        try {
            setSettingCode({ ...settingCode, [`round${roundNumber}`]: true });
            const code = newRoundCodes[`round${roundNumber}`];
            if (!code.trim()) {
                alert(`Please enter a code for Round ${roundNumber}`);
                return;
            }

            const response = await adminApiCall(`/admin/round-codes`, {
                method: 'POST',
                body: JSON.stringify({
                    round: roundNumber,
                    code: code.trim()
                })
            });

            if (response.success) {
                setRoundCodes({ ...roundCodes, [`round${roundNumber}`]: code.trim() });
                setNewRoundCodes({ ...newRoundCodes, [`round${roundNumber}`]: '' });
                alert(`Round ${roundNumber} code set successfully!`);
            } else {
                alert(response.message || `Error setting Round ${roundNumber} code`);
            }
        } catch (error) {
            console.error(`Error setting Round ${roundNumber} code:`, error);
            alert(`Error setting Round ${roundNumber} code: ${error.message}`);
        } finally {
            setSettingCode({ ...settingCode, [`round${roundNumber}`]: false });
        }
    };

    const handleResetCode = async (roundNumber) => {
        try {
            if (window.confirm(`Are you sure you want to reset Round ${roundNumber} code?`)) {
                const response = await adminApiCall(`/admin/round-codes/${roundNumber}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    setRoundCodes({ ...roundCodes, [`round${roundNumber}`]: '' });
                    setNewRoundCodes({ ...newRoundCodes, [`round${roundNumber}`]: '' });
                    alert(`Round ${roundNumber} code reset successfully!`);
                } else {
                    alert(response.message || `Error resetting Round ${roundNumber} code`);
                }
            }
        } catch (error) {
            console.error(`Error resetting Round ${roundNumber} code:`, error);
            alert(`Error resetting Round ${roundNumber} code: ${error.message}`);
        }
    };

    const updateTeamStatus = async (teamId, type, status) => {
        try {
            const response = await adminApiCall(`/admin/teams/${teamId}/status`, {
                method: 'PUT',
                body: JSON.stringify({
                    competitionStatus: status
                })
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
            case 'Registered':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'Round1':
                return 'bg-blue-500/20 text-blue-300';
            case 'Round2':
                return 'bg-green-500/20 text-green-300';
            case 'Round3':
                return 'bg-purple-500/20 text-purple-300';
            case 'Eliminated':
                return 'bg-red-500/20 text-red-300';
            case 'Selected':
                return 'bg-emerald-500/20 text-emerald-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Registered':
                return 'REGISTERED';
            case 'Round1':
                return 'ROUND 1';
            case 'Round2':
                return 'ROUND 2';
            case 'Round3':
                return 'ROUND 3';
            case 'Eliminated':
                return 'ELIMINATED';
            case 'Selected':
                return 'SELECTED';
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
            setRound3Loading(true);
            setRound3Error(null);

            // Check if admin is authenticated before making the request
            if (!adminAuthService.isAdminAuthenticated()) {
                throw new Error('Admin not authenticated. Please log in.');
            }

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

            setRound3Teams(sortedTeams);
        } catch (error) {
            console.error('Error fetching Round 3 results:', error);
            setRound3Error(error.message);

            // If authentication error, redirect to login
            if (error.message.includes('Invalid token') || error.message.includes('not authenticated')) {
                navigate('/admin/login');
                return;
            }

            // Set empty array on error - no mock data
            setRound3Teams([]);
        } finally {
            setRound3Loading(false);
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

    // Round 3 program viewing functions
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

    // Team Management Functions
    const fetchTeamManagementData = async () => {
        try {
            setDataLoading(true);
            // Reset announced rounds state
            setAnnouncedRounds({
                round1: false,
                round2: false,
                round3: false
            });

            const response = await adminApiCall('/admin/teamManagement');
            console.log('Team Management response:', response);
            if (response.success) {
                setTeamManagementData(response.data);

                // Check which rounds have been announced based on team data
                const teams = response.data.teams;
                const round1Announced = teams.some(team =>
                    team.competitionStatus === 'Round1' && team.resultsAnnounced
                );
                const round2Announced = teams.some(team =>
                    team.competitionStatus === 'Round2' && team.resultsAnnounced
                );
                const round3Announced = teams.some(team =>
                    team.competitionStatus === 'Round3' && team.resultsAnnounced
                );

                setAnnouncedRounds({
                    round1: round1Announced,
                    round2: round2Announced,
                    round3: round3Announced
                });
            }
        } catch (error) {
            console.error('Error fetching team management data:', error);
            // Reset announced rounds when API fails
            setAnnouncedRounds({
                round1: false,
                round2: false,
                round3: false
            });

            // Show empty state instead of null
            setTeamManagementData({
                teams: [],
                stats: {
                    totalTeams: 0,
                    registered: 0,
                    round1: 0,
                    round2: 0,
                    round3: 0,
                    eliminated: 0,
                    selected: 0,
                    hasCompletedCycle: 0,
                    resultsAnnounced: 0
                }
            });
        } finally {
            setDataLoading(false);
        }
    };

    const handleResetTeam = async (teamId) => {
        try {
            if (window.confirm('Are you sure you want to reset this team\'s progress? This will clear all scores and allow them to start over.')) {
                const response = await adminApiCall(`/admin/resetTeam/${teamId}`, {
                    method: 'POST'
                });
                if (response.success) {
                    alert('Team progress reset successfully!');
                    await fetchTeamManagementData();
                } else {
                    alert('Error resetting team progress');
                }
            }
        } catch (error) {
            console.error('Error resetting team:', error);
            alert('Error resetting team progress');
        }
    };

    const handleUpdateTeamStatus = async (teamId, newStatus) => {
        try {
            const response = await adminApiCall(`/admin/updateStatus/${teamId}`, {
                method: 'PATCH',
                body: JSON.stringify({ competitionStatus: newStatus })
            });
            if (response.success) {
                alert('Team status updated successfully!');
                await fetchTeamManagementData();
            } else {
                alert('Error updating team status');
            }
        } catch (error) {
            console.error('Error updating team status:', error);
            alert('Error updating team status');
        }
    };


    // Team selection functions
    const handleTeamSelection = (teamId) => {
        setSelectedTeams(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleSelectAll = () => {
        const eligibleTeams = getEligibleTeamsForAdvancement();
        setSelectedTeams(eligibleTeams.map(team => team._id));
    };

    const handleDeselectAll = () => {
        setSelectedTeams([]);
    };

    const getEligibleTeamsForAdvancement = () => {
        if (!teamManagementData?.teams) return [];
        return teamManagementData.teams.filter(team =>
            team.competitionStatus !== 'Eliminated' &&
            team.competitionStatus !== 'Selected'
        );
    };

    const handleAdvanceSelectedTeams = async () => {
        try {
            if (selectedTeams.length === 0) {
                alert('Please select at least one team to advance');
                return;
            }

            // Determine which round to advance to based on selected teams' current status
            const selectedTeamData = teamManagementData.teams.filter(team => selectedTeams.includes(team._id));
            const statuses = [...new Set(selectedTeamData.map(team => team.competitionStatus))];

            if (statuses.length > 1) {
                alert('Please select teams from the same round only');
                return;
            }

            let roundNumber;
            switch (statuses[0]) {
                case 'Registered':
                    roundNumber = 1;
                    break;
                case 'Round1':
                    roundNumber = 2;
                    break;
                case 'Round2':
                    roundNumber = 3;
                    break;
                default:
                    alert('Selected teams cannot be advanced');
                    return;
            }

            if (window.confirm(`Are you sure you want to advance ${selectedTeams.length} teams to Round ${roundNumber} and eliminate the rest?`)) {
                setSelectionLoading(true);
                const response = await adminApiCall(`/admin/round/${roundNumber}/select`, {
                    method: 'POST',
                    body: JSON.stringify({ selectedTeamIds: selectedTeams })
                });

                if (response.success) {
                    alert(`Round ${roundNumber} selection completed! ${response.data.selectedCount} teams advanced, ${response.data.eliminatedCount} teams eliminated.`);
                    setSelectedTeams([]);
                    await fetchTeamManagementData();
                } else {
                    alert('Error processing team selection');
                }
            }
        } catch (error) {
            console.error('Error processing selection:', error);
            alert('Error processing team selection');
        } finally {
            setSelectionLoading(false);
        }
    };

    const handleResetAllTeams = async () => {
        try {
            if (window.confirm('Are you sure you want to reset ALL teams? This will clear all progress and set all teams back to "Registered" status. This action cannot be undone.')) {
                setSelectionLoading(true);

                // Reset all teams one by one
                const resetPromises = teamManagementData.teams.map(team =>
                    adminApiCall(`/admin/resetTeam/${team._id}`, { method: 'POST' })
                );

                await Promise.all(resetPromises);

                // Reset announced rounds state
                setAnnouncedRounds({
                    round1: false,
                    round2: false,
                    round3: false
                });

                alert('All teams have been reset successfully! All teams are now back to "Registered" status.');
                setSelectedTeams([]);
                await fetchTeamManagementData();
            }
        } catch (error) {
            console.error('Error resetting all teams:', error);
            alert('Error resetting all teams. Please try again.');
        } finally {
            setSelectionLoading(false);
        }
    };

    const handleResetAnnouncedRounds = () => {
        if (window.confirm('Are you sure you want to reset the announced rounds state? This will unlock all "Announce Results" buttons.')) {
            setAnnouncedRounds({
                round1: false,
                round2: false,
                round3: false
            });
            alert('Announced rounds state has been reset! All "Announce Results" buttons are now unlocked.');
        }
    };

    const handleRefreshData = async () => {
        try {
            setSelectionLoading(true);
            setDataLoading(true);
            await fetchTeamManagementData();
            alert('Data refreshed successfully! Fresh data loaded from database.');
        } catch (error) {
            console.error('Error refreshing data:', error);
            alert('Error refreshing data. Please try again.');
        } finally {
            setSelectionLoading(false);
            setDataLoading(false);
        }
    };

    const handleAnnounceResults = async (roundNumber) => {
        try {
            if (window.confirm(`Are you sure you want to announce Round ${roundNumber} results? This will make the results visible to all teams.`)) {
                setSelectionLoading(true);

                const response = await adminApiCall('/admin/announceResults', {
                    method: 'POST',
                    body: JSON.stringify({ round: roundNumber })
                });

                if (response.success) {
                    alert(`Round ${roundNumber} results have been announced successfully! Teams can now see their updated status.`);

                    // Lock the button for this round
                    setAnnouncedRounds(prev => ({
                        ...prev,
                        [`round${roundNumber}`]: true
                    }));

                    await fetchTeamManagementData();
                } else {
                    alert('Error announcing results. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error announcing results:', error);
            alert('Error announcing results. Please try again.');
        } finally {
            setSelectionLoading(false);
        }
    };

    // Admin logout function
    const handleAdminLogout = async () => {
        try {
            await adminAuthService.adminLogout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            adminAuthService.removeAdminToken();
            adminAuthService.removeAdminData();
            navigate('/admin/login');
        }
    };

    const renderDashboard = () => (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-1"></div>
                    <div className="flex-1 text-center">
                        <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-purple-300 to-blue-300 bg-clip-text text-transparent drop-shadow-2xl">
                            Admin Dashboard
                        </h1>
                        <p className="text-lg text-gray-300 mt-2">Manage competition rounds and monitor team progress</p>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <div className="flex items-center">
                            {adminData && (
                                <div className="text-right">
                                    <p className="text-white/80 text-sm">Welcome, {adminData.username}</p>
                                    <p className="text-white/60 text-xs">Administrator</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Teams Count */}
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 shadow-xl mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Total Teams Registered</h3>
                        <p className="text-gray-300">All competition participants</p>
                    </div>
                    <div className="text-right">
                        <p className="text-5xl font-bold text-white">{stats.totalTeams}</p>
                        <p className="text-purple-300 text-sm">Active Teams</p>
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
                        onClick={() => handleAnnounceResults(1)}
                        disabled={selectionLoading || announcedRounds.round1}
                        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-500 transform shadow-xl ${announcedRounds.round1
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 hover:scale-105 glow-green'
                            }`}
                    >
                        {selectionLoading ? 'Processing...' :
                            announcedRounds.round1 ? 'Round 1 Results Announced ✓' :
                                'Announce Round 1 Results'}
                    </button>
                </div>

                {/* Round 2 Results Announcement */}
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 shadow-xl">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">Round 2 Results</h3>
                        <p className="text-gray-300 text-sm">Coding Challenge</p>
                    </div>
                    <button
                        onClick={() => handleAnnounceResults(2)}
                        disabled={selectionLoading || announcedRounds.round2}
                        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-500 transform shadow-xl ${announcedRounds.round2
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 hover:scale-105 glow-purple'
                            }`}
                    >
                        {selectionLoading ? 'Processing...' :
                            announcedRounds.round2 ? 'Round 2 Results Announced ✓' :
                                'Announce Round 2 Results'}
                    </button>
                </div>

                {/* Round 3 Results Announcement */}
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 shadow-xl">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-white">Round 3 Results</h3>
                        <p className="text-gray-300 text-sm">Final Challenge</p>
                    </div>
                    <button
                        onClick={() => handleAnnounceResults(3)}
                        disabled={selectionLoading || announcedRounds.round3}
                        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-500 transform shadow-xl ${announcedRounds.round3
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 hover:scale-105 glow-purple'
                            }`}
                    >
                        {selectionLoading ? 'Processing...' :
                            announcedRounds.round3 ? 'Round 3 Results Announced ✓' :
                                'Announce Round 3 Results'}
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
                        {/* Current Code Display */}
                        {roundCodes.round2 && (
                            <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4">
                                <label className="block text-sm font-medium text-green-300 mb-2">Current Code</label>
                                <div className="flex items-center justify-between">
                                    <code className="text-green-200 font-mono text-lg">{roundCodes.round2}</code>
                                    <button
                                        onClick={() => handleResetCode(2)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Set New Code */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Set Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter new round 2 code"
                                    value={newRoundCodes.round2 || ''}
                                    onChange={(e) => setNewRoundCodes({ ...newRoundCodes, round2: e.target.value })}
                                    className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => handleSetCode(2)}
                                    disabled={settingCode.round2 || !newRoundCodes.round2.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
                                >
                                    {settingCode.round2 ? 'Setting...' : 'Set'}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleStartRound2}
                            disabled={!roundCodes.round2}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg"
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
                        {/* Current Code Display */}
                        {roundCodes.round3 && (
                            <div className="bg-green-600/20 border border-green-400/30 rounded-lg p-4">
                                <label className="block text-sm font-medium text-green-300 mb-2">Current Code</label>
                                <div className="flex items-center justify-between">
                                    <code className="text-green-200 font-mono text-lg">{roundCodes.round3}</code>
                                    <button
                                        onClick={() => handleResetCode(3)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Set New Code */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Set Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter new round 3 code"
                                    value={newRoundCodes.round3 || ''}
                                    onChange={(e) => setNewRoundCodes({ ...newRoundCodes, round3: e.target.value })}
                                    className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    onClick={() => handleSetCode(3)}
                                    disabled={settingCode.round3 || !newRoundCodes.round3.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
                                >
                                    {settingCode.round3 ? 'Setting...' : 'Set'}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleStartRound3}
                            disabled={!roundCodes.round3}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 transform shadow-lg"
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
                {dataLoading && (
                    <div className="flex justify-center items-center mt-4 text-blue-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-3"></div>
                        Loading fresh data from database...
                    </div>
                )}
            </div>


            {/* Round Count Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Total Teams</p>
                    <p className="text-3xl font-bold text-white">{teamManagementData?.stats?.totalTeams || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Registered</p>
                    <p className="text-3xl font-bold text-white">{teamManagementData?.stats?.registered || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Round 2</p>
                    <p className="text-3xl font-bold text-white">{teamManagementData?.stats?.round2 || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Round 3</p>
                    <p className="text-3xl font-bold text-white">{teamManagementData?.stats?.round3 || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Eliminated</p>
                    <p className="text-3xl font-bold text-white">{teamManagementData?.stats?.eliminated || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-300 mb-1">Selected</p>
                    <p className="text-3xl font-bold text-white">{teamManagementData?.stats?.selected || 0}</p>
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
                            <option value="Registered">Registered</option>
                            <option value="Round1">Round 1</option>
                            <option value="Round2">Round 2</option>
                            <option value="Round3">Round 3</option>
                            <option value="Eliminated">Eliminated</option>
                            <option value="Selected">Selected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Team Selection Controls */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Team Selection</h3>
                        <p className="text-gray-300 text-sm">
                            Select teams to advance to the next round. Selected teams will advance, unselected teams will be eliminated.
                        </p>
                        <p className="text-sm text-blue-300 mt-1">
                            {selectedTeams.length} / {getEligibleTeamsForAdvancement().length} selected
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSelectAll}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            Select All
                        </button>
                        <button
                            onClick={handleDeselectAll}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            Deselect All
                        </button>
                        <button
                            onClick={handleAdvanceSelectedTeams}
                            disabled={selectedTeams.length === 0 || selectionLoading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            {selectionLoading ? 'Processing...' : `Advance ${selectedTeams.length} Teams`}
                        </button>
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
                                <th className="px-6 py-4 text-left text-white font-semibold">Current Status</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Next Round Eligibility</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Score</th>
                                <th className="px-6 py-4 text-left text-white font-semibold">Reset</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(teamManagementData?.teams || [])
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
                                                <div className="flex items-center gap-2 mt-1">
                                                    {team.hasCompletedCycle && (
                                                        <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full">
                                                            Completed Cycle
                                                        </span>
                                                    )}
                                                    {team.resultsAnnounced && (
                                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                                                            Results Announced
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.competitionStatus)}`}>
                                                {getStatusText(team.competitionStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {team.competitionStatus !== 'Eliminated' && team.competitionStatus !== 'Selected' ? (
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTeams.includes(team._id)}
                                                        onChange={() => handleTeamSelection(team._id)}
                                                        className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-300">Select</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">–</span>
                                            )}
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
                                            <button
                                                onClick={() => handleResetTeam(team._id)}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                                            >
                                                Reset Team
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Control Buttons */}
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={handleRefreshData}
                        disabled={selectionLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        {selectionLoading ? 'Refreshing...' : '🔄 Refresh Data'}
                    </button>
                    <button
                        onClick={handleResetAllTeams}
                        disabled={selectionLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        {selectionLoading ? 'Processing...' : 'Reset All Teams'}
                    </button>
                    <button
                        onClick={handleResetAnnouncedRounds}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Reset Announced Rounds
                    </button>
                </div>

                {/* No teams found message */}
                {(teamManagementData?.teams || []).filter(team => {
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
        // Show program viewing mode if a team is selected
        if (showPrograms && selectedTeam) {
            return (
                <div className="p-8">
                    <div className="w-full max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 text-indigo-400">
                            {selectedTeam.teamName} - All Programs
                        </h1>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full mb-4">
                                <span className="text-purple-400 font-semibold">Question Order:</span>
                                <span className="text-white font-bold">{selectedTeam.round3QuestionOrderName || 'Unknown'}</span>
                            </div>
                        </div>

                        {/* Overall Program Summary */}

                        {/* Program by Question */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-4 text-blue-400">Program by Question</h2>
                            <div className="space-y-8">
                                {(() => {
                                    const questionGroups = {};
                                    if (selectedTeam.round3QuestionResults && selectedTeam.round3QuestionResults.length > 0) {
                                        selectedTeam.round3QuestionResults.forEach(result => {
                                            if (!questionGroups[result.questionIndex]) {
                                                questionGroups[result.questionIndex] = [];
                                            }
                                            questionGroups[result.questionIndex].push(result);
                                        });
                                    }

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
                                                            {questionResults.sort((a, b) => a.blockIndex - b.blockIndex).map((result, blockIndex) => (
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
                                                            ))}
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


                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleBackToList}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                            >
                                Back to Teams
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Show loading state
        if (round3Loading) {
            return (
                <div className="p-8 flex items-center justify-center h-64">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                        Loading Round 3 Results...
                    </div>
                </div>
            );
        }

        // Show error state
        if (round3Error) {
            return (
                <div className="p-8 text-center">
                    <div className="text-red-500">
                        <h2 className="text-2xl font-bold mb-4">Error Loading Round 3 Results</h2>
                        <p className="mb-4">Error: {round3Error}</p>
                        <button
                            onClick={fetchRound3Results}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        // Main Round 3 results view
        return (
            <div className="p-6">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Admin Dashboard
                    </h1>
                    <p className="text-base text-gray-300 mb-2">Team Results and Performance Analytics</p>
                    <p className="text-xs text-gray-400">Teams found: {round3Teams.length}</p>
                </div>


                {/* Round 3 Results - Compact Card Layout */}
                {round3Teams.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-8">
                            <p className="text-gray-400 text-lg mb-2">No Round 3 submissions found</p>
                            <p className="text-gray-500 text-sm">Teams need to complete Round 3 to appear here</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {round3Teams.map((team, index) => {
                            const rank = index + 1;

                            // Get individual question scores for Q1-Q5
                            const q1Score = (team.round3IndividualScores || []).find(q => q.questionIndex === 0)?.score || 0;
                            const q2Score = (team.round3IndividualScores || []).find(q => q.questionIndex === 1)?.score || 0;
                            const q3Score = (team.round3IndividualScores || []).find(q => q.questionIndex === 2)?.score || 0;
                            const q4Score = (team.round3IndividualScores || []).find(q => q.questionIndex === 3)?.score || 0;
                            const q5Score = (team.round3IndividualScores || []).find(q => q.questionIndex === 4)?.score || 0;

                            return (
                                <div key={team._id || index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                                    <div className="flex items-center justify-between">
                                        {/* Left Area: Submission Information */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-semibold">
                                                    #{rank} - {team.teamName || 'Unknown Team'}
                                                </button>
                                                <div className="text-xs text-gray-400">
                                                    <div>{team.round3SubmittedAt ? new Date(team.round3SubmittedAt).toLocaleString() : 'Unknown'}</div>
                                                    <div>Order: {team.round3QuestionOrderName || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Middle Area: Order ID and Question Scores */}
                                        <div className="flex-1 px-4">
                                            <div className="flex items-center gap-3">
                                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm font-semibold">
                                                    Order ID: {team.round3QuestionOrderName?.replace('Order ', '') || 'Unknown'}
                                                </button>
                                                <div className="flex gap-1.5">
                                                    <div className={`w-8 h-8 rounded text-center flex flex-col justify-center ${q1Score > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                                        <div className="text-xs leading-none">Q1</div>
                                                        <div className="text-xs font-bold leading-none">{q1Score}</div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded text-center flex flex-col justify-center ${q2Score > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                                        <div className="text-xs leading-none">Q2</div>
                                                        <div className="text-xs font-bold leading-none">{q2Score}</div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded text-center flex flex-col justify-center ${q3Score > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                                        <div className="text-xs leading-none">Q3</div>
                                                        <div className="text-xs font-bold leading-none">{q3Score}</div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded text-center flex flex-col justify-center ${q4Score > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                                        <div className="text-xs leading-none">Q4</div>
                                                        <div className="text-xs font-bold leading-none">{q4Score}</div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded text-center flex flex-col justify-center ${q5Score > 0 ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                                        <div className="text-xs leading-none">Q5</div>
                                                        <div className="text-xs font-bold leading-none">{q5Score}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Area: Performance Metrics and Action Button */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs space-y-0.5">
                                                    <div className="text-blue-400">
                                                        Score: <span className="font-bold text-white">{team.round3Score || 0}</span>
                                                    </div>
                                                    <div className="text-yellow-400">
                                                        Time: <span className="font-bold text-white">{formatTime(team.round3Time || 0)}</span>
                                                    </div>
                                                    <div className="text-blue-400">
                                                        Rank: <span className="font-bold text-white">#{rank}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleViewPrograms(team)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition duration-200"
                                                >
                                                    View Program
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Back to Game Button */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-200"
                    >
                        Back to Game
                    </button>
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
                return <Round2AdminDashboard />;
            case 'round3':
                return renderRound3Results();
            default:
                return renderDashboard();
        }
    };

    if (loading || !isAuthenticated) {
        return (
            <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">
                        {!isAuthenticated ? 'Verifying admin access...' : 'Loading admin dashboard...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen flex">
            {/* Sidebar */}
            <div className="w-64 bg-white/20 backdrop-blur-sm border-r border-white/30 shadow-lg">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white text-center mb-8">Admin</h1>
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
                            Round 2 Admin
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

                    {/* Logout Button */}
                    <div className="mt-8 pt-4 border-t border-white/20">
                        <button
                            onClick={handleAdminLogout}
                            className="w-full text-left px-4 py-3 rounded-lg transition-colors text-red-300 hover:bg-red-500/20 hover:text-red-200"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </div>
                        </button>
                    </div>
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