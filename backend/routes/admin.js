import express from 'express';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import RoundCodes from '../models/RoundCodes.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// @desc    Get all teams (Admin only)
// @route   GET /api/admin/teams
// @access  Private (Admin)
const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find({ isActive: true })
            .select('-password')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            data: {
                teams
            }
        });
    } catch (error) {
        console.error('Get all teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching teams'
        });
    }
};

// @desc    Update team status (Admin only)
// @route   PUT /api/admin/teams/:id/status
// @access  Private (Admin)
const updateTeamStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { competitionStatus, scores } = req.body;

        const validStatuses = ['Registered', 'Round1', 'Round2', 'Round3', 'Eliminated', 'Selected'];

        if (competitionStatus && !validStatuses.includes(competitionStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid competition status'
            });
        }

        const updateData = {};
        if (competitionStatus) updateData.competitionStatus = competitionStatus;
        if (scores) {
            updateData.scores = { ...scores };
            updateData.scores.total = (updateData.scores.round1 || 0) +
                (updateData.scores.round2 || 0) +
                (updateData.scores.round3 || 0);
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedTeam) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Team status updated successfully',
            data: {
                team: updatedTeam
            }
        });

    } catch (error) {
        console.error('Update team status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating team status'
        });
    }
};

// @desc    Announce round results (Admin only)
// @route   POST /api/admin/announceResults
// @access  Private (Admin)
const announceResults = async (req, res) => {
    try {
        const { round } = req.body;
        const validRounds = [1, 2, 3];

        if (!validRounds.includes(round)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid round number'
            });
        }

        // Update all teams' resultsAnnounced status based on their current competition status
        let updateQuery = {};
        let message = '';

        switch (round) {
            case 1:
                // Announce Round 1 results - teams in Round1 status can see their advancement
                updateQuery = { competitionStatus: 'Round1' };
                message = 'Round 1 results announced successfully! Teams can now see their advancement status.';
                break;
            case 2:
                // Announce Round 2 results - teams in Round2 status can see their advancement
                updateQuery = { competitionStatus: 'Round2' };
                message = 'Round 2 results announced successfully! Teams can now see their advancement status.';
                break;
            case 3:
                // Announce Round 3 results - teams in Round3 status can see their advancement
                updateQuery = { competitionStatus: 'Round3' };
                message = 'Round 3 results announced successfully! Teams can now see their advancement status.';
                break;
        }

        // Update resultsAnnounced for teams in the specified round
        const result = await Team.updateMany(updateQuery, {
            resultsAnnounced: true
        });

        res.status(200).json({
            success: true,
            message: message,
            data: {
                updatedCount: result.modifiedCount,
                round: round
            }
        });

    } catch (error) {
        console.error('Announce results error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while announcing results'
        });
    }
};

// @desc    Start round with code (Admin only)
// @route   POST /api/admin/start/:round
// @access  Private (Admin)
const startRound = async (req, res) => {
    try {
        const { round } = req.params;
        const { code } = req.body;
        const validRounds = ['2', '3'];

        if (!validRounds.includes(round)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid round number'
            });
        }

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Round code is required'
            });
        }

        // Set the round code in database
        const roundNumber = parseInt(round);
        await RoundCodes.setRoundCode(roundNumber, code);

        res.status(200).json({
            success: true,
            message: `Round ${round} started successfully with code: ${code}`
        });

    } catch (error) {
        console.error('Start round error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while starting round'
        });
    }
};

// @desc    Get competition statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getCompetitionStats = async (req, res) => {
    try {
        const totalTeams = await Team.countDocuments({ isActive: true });
        const registeredTeams = await Team.countDocuments({
            isActive: true,
            competitionStatus: 'Registered'
        });
        const round1Completed = await Team.countDocuments({
            isActive: true,
            competitionStatus: { $in: ['Round1', 'Round2', 'Round3', 'Selected'] }
        });
        const round2Completed = await Team.countDocuments({
            isActive: true,
            competitionStatus: { $in: ['Round2', 'Round3', 'Selected'] }
        });
        const round3Completed = await Team.countDocuments({
            isActive: true,
            competitionStatus: { $in: ['Round3', 'Selected'] }
        });

        // Get round codes
        const round2Code = await RoundCodes.getActiveCode(2);
        const round3Code = await RoundCodes.getActiveCode(3);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalTeams,
                    registeredTeams,
                    round1Completed,
                    round2Completed,
                    round3Completed
                },
                roundCodes: {
                    round2: round2Code ? round2Code.code : null,
                    round3: round3Code ? round3Code.code : null
                }
            }
        });
    } catch (error) {
        console.error('Get competition stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching competition statistics'
        });
    }
};

// @desc    Get round codes (Admin only)
// @route   GET /api/admin/round-codes
// @access  Private (Admin)
const getRoundCodes = async (req, res) => {
    try {
        const round2Code = await RoundCodes.getActiveCode(2);
        const round3Code = await RoundCodes.getActiveCode(3);

        res.status(200).json({
            success: true,
            data: {
                roundCodes: {
                    round2: round2Code ? {
                        code: round2Code.code,
                        usageCount: round2Code.usageCount,
                        completionCount: round2Code.completionCount,
                        createdAt: round2Code.createdAt
                    } : null,
                    round3: round3Code ? {
                        code: round3Code.code,
                        usageCount: round3Code.usageCount,
                        completionCount: round3Code.completionCount,
                        createdAt: round3Code.createdAt
                    } : null
                }
            }
        });
    } catch (error) {
        console.error('Get round codes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching round codes'
        });
    }
};

// Apply routes
router.get('/teams', adminAuth, getAllTeams);
// @desc    Set round code (Admin only)
// @route   POST /api/admin/round-codes
// @access  Private (Admin)
const setRoundCode = async (req, res) => {
    try {
        const { round, code } = req.body;

        if (!round || !code) {
            return res.status(400).json({
                success: false,
                message: 'Round number and code are required'
            });
        }

        if (![2, 3].includes(parseInt(round))) {
            return res.status(400).json({
                success: false,
                message: 'Round must be 2 or 3'
            });
        }

        // Update or create round code using findOneAndUpdate
        const newCode = await RoundCodes.findOneAndUpdate(
            { round: parseInt(round) },
            {
                code: code.trim(),
                isActive: true,
                usageCount: 0,
                completionCount: 0,
                updatedAt: Date.now()
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        res.status(200).json({
            success: true,
            message: `Round ${round} code set successfully`,
            data: {
                round: newCode.round,
                code: newCode.code
            }
        });
    } catch (error) {
        console.error('Set round code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while setting round code'
        });
    }
};

// @desc    Reset round code (Admin only)
// @route   DELETE /api/admin/round-codes/:round
// @access  Private (Admin)
const resetRoundCode = async (req, res) => {
    try {
        const { round } = req.params;

        if (![2, 3].includes(parseInt(round))) {
            return res.status(400).json({
                success: false,
                message: 'Round must be 2 or 3'
            });
        }

        // Deactivate all codes for this round
        const result = await RoundCodes.updateMany(
            { round: parseInt(round) },
            { isActive: false }
        );

        res.status(200).json({
            success: true,
            message: `Round ${round} code reset successfully`,
            data: {
                round: parseInt(round),
                deactivatedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Reset round code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting round code'
        });
    }
};

// @desc    Get Round 2 admin data (Admin only)
// @route   GET /api/admin/round2/data
// @access  Private (Admin)
const getRound2AdminData = async (req, res) => {
    try {
        console.log('Getting Round 2 admin data...');

        // Get all teams that have participated in Round 2
        const teams = await Team.find({
            isActive: true,
            $or: [
                { competitionStatus: 'round2_completed' },
                { competitionStatus: 'round3_completed' },
                { 'scores.round2': { $gt: 0 } },
                { 'startTime': { $exists: true } }
            ]
        })
            .select('-password')
            .sort({ totalScore: -1, totalTimeTaken: 1 });

        console.log('Teams found:', teams.length);

        // Get all submissions for Round 2
        console.log('Getting submissions...');
        const submissions = await Submission.find({
            $or: [
                { questionType: 'aptitude' },
                { challengeType: { $in: ['debug', 'trace', 'program'] } }
            ]
        })
            .populate('team', 'teamName members leader')
            .sort({ createdAt: -1 });

        console.log('Submissions found:', submissions.length);

        // Calculate statistics
        const totalParticipants = teams.length;
        const completedTeams = teams.filter(team => team.isQuizCompleted).length;
        const averageScore = totalParticipants > 0
            ? Math.round(teams.reduce((sum, team) => sum + (team.totalScore || 0), 0) / totalParticipants)
            : 0;
        const highestScore = totalParticipants > 0
            ? Math.max(...teams.map(team => team.totalScore || 0))
            : 0;

        res.status(200).json({
            success: true,
            data: {
                teams: teams.map(team => ({
                    _id: team._id,
                    teamName: team.teamName,
                    members: team.members,
                    leader: team.leader,
                    totalScore: team.totalScore || 0,
                    totalTimeTaken: team.totalTimeTaken || 0,
                    isQuizCompleted: team.isQuizCompleted || false,
                    startTime: team.startTime,
                    endTime: team.endTime,
                    scores: team.scores || {},
                    completedQuestions: team.completedQuestions || {},
                    aptitudeAttempts: team.aptitudeAttempts || {}
                })),
                submissions: submissions.map(sub => ({
                    _id: sub._id,
                    team: sub.team,
                    questionNumber: sub.questionNumber,
                    questionType: sub.questionType,
                    challengeType: sub.challengeType,
                    originalQuestion: sub.originalQuestion,
                    userSolution: sub.userSolution,
                    timeTaken: sub.timeTaken,
                    attemptNumber: sub.attemptNumber,
                    isCorrect: sub.isCorrect,
                    score: sub.score,
                    isAutoSaved: sub.isAutoSaved,
                    createdAt: sub.createdAt
                })),
                statistics: {
                    totalParticipants,
                    completedTeams,
                    averageScore,
                    highestScore
                }
            }
        });
    } catch (error) {
        console.error('Get Round 2 admin data error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({
            success: false,
            message: 'Server error while fetching Round 2 admin data',
            error: error.message
        });
    }
};

// @desc    Get team's Round 2 submissions (Admin only)
// @route   GET /api/admin/round2/team/:teamId/submissions
// @access  Private (Admin)
const getTeamRound2Submissions = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId).select('-password');
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        const submissions = await Submission.find({
            team: teamId,
            $or: [
                { questionType: 'aptitude' },
                { challengeType: { $in: ['debug', 'trace', 'program'] } }
            ]
        })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                team: {
                    _id: team._id,
                    teamName: team.teamName,
                    members: team.members,
                    leader: team.leader,
                    totalScore: team.totalScore || 0,
                    totalTimeTaken: team.totalTimeTaken || 0,
                    isQuizCompleted: team.isQuizCompleted || false,
                    startTime: team.startTime,
                    endTime: team.endTime,
                    scores: team.scores || {},
                    completedQuestions: team.completedQuestions || {},
                    aptitudeAttempts: team.aptitudeAttempts || {}
                },
                submissions: submissions.map(sub => ({
                    _id: sub._id,
                    questionNumber: sub.questionNumber,
                    questionType: sub.questionType,
                    challengeType: sub.challengeType,
                    originalQuestion: sub.originalQuestion,
                    userSolution: sub.userSolution,
                    timeTaken: sub.timeTaken,
                    attemptNumber: sub.attemptNumber,
                    isCorrect: sub.isCorrect,
                    score: sub.score,
                    isAutoSaved: sub.isAutoSaved,
                    createdAt: sub.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get team Round 2 submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching team Round 2 submissions'
        });
    }
};

// @desc    Validate admin token (Admin only)
// @route   GET /api/admin/validate
// @access  Private (Admin)
const validateAdminToken = async (req, res) => {
    try {
        // If we reach here, the adminAuth middleware has already validated the token
        res.status(200).json({
            success: true,
            message: 'Admin token is valid',
            data: {
                admin: req.admin
            }
        });
    } catch (error) {
        console.error('Validate admin token error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while validating admin token'
        });
    }
};

router.get('/validate', adminAuth, validateAdminToken);
router.put('/teams/:id/status', adminAuth, updateTeamStatus);
router.post('/announceResults', adminAuth, announceResults);
router.post('/start/:round', adminAuth, startRound);
router.get('/stats', adminAuth, getCompetitionStats);
router.get('/round-codes', adminAuth, getRoundCodes);
router.post('/round-codes', adminAuth, setRoundCode);
router.delete('/round-codes/:round', adminAuth, resetRoundCode);
router.get('/round2/data', adminAuth, getRound2AdminData);
router.get('/round2/team/:teamId/submissions', adminAuth, getTeamRound2Submissions);

// @desc    Reset team progress (Admin only)
// @route   POST /api/admin/resetTeam/:teamId
// @access  Private (Admin)
const resetTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Reset team progress
        const resetData = {
            competitionStatus: 'Registered',
            hasCompletedCycle: false,
            resultsAnnounced: false,
            // Reset scores
            scores: {
                round1: 0,
                round2: 0,
                round3: 0,
                total: 0
            },
            // Reset Round 2 specific fields
            startTime: null,
            endTime: null,
            totalTimeTaken: 0,
            isQuizCompleted: false,
            totalScore: 0,
            unlockedQuestions: {
                q1: true,
                q2: false,
                q3: false,
                q4: false,
                q5: false,
                q6: false
            },
            completedQuestions: {
                q1: false,
                q2: false,
                q3: false,
                q4: false,
                q5: false,
                q6: false
            },
            scores: {
                q1: 0,
                q2: 0,
                q3: 0,
                q4: 0,
                q5: 0,
                q6: 0
            },
            aptitudeAttempts: {
                q1: 0,
                q2: 0,
                q3: 0
            },
            // Reset Round 3 specific fields
            round3Score: 0,
            round3Time: 0,
            round3Program: '',
            round3QuestionOrder: null,
            round3QuestionOrderName: '',
            round3QuestionResults: [],
            round3IndividualScores: [],
            round3Completed: false,
            round3SubmittedAt: null
        };

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            resetData,
            { new: true }
        ).select('-password');

        // Delete all submissions for this team
        await Submission.deleteMany({ team: teamId });

        res.status(200).json({
            success: true,
            message: 'Team progress reset successfully',
            data: {
                team: updatedTeam
            }
        });

    } catch (error) {
        console.error('Reset team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting team progress'
        });
    }
};

// @desc    Update team status (Admin only)
// @route   PATCH /api/admin/updateStatus/:teamId
// @access  Private (Admin)
const updateTeamStatusNew = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { competitionStatus } = req.body;

        const validStatuses = ['Registered', 'Round1', 'Round2', 'Round3', 'Eliminated', 'Selected'];

        if (!validStatuses.includes(competitionStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid competition status'
            });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { competitionStatus },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Team status updated successfully',
            data: {
                team: updatedTeam
            }
        });

    } catch (error) {
        console.error('Update team status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating team status'
        });
    }
};

// @desc    Announce results (Admin only)
// @route   POST /api/admin/announceResults
// @access  Private (Admin)

// @desc    Get teams for round selection (Admin only)
// @route   GET /api/admin/round/:roundNumber/teams
// @access  Private (Admin)
const getRoundTeams = async (req, res) => {
    try {
        const { roundNumber } = req.params;
        const validRounds = ['1', '2', '3'];

        if (!validRounds.includes(roundNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid round number'
            });
        }

        let statusFilter;
        switch (roundNumber) {
            case '1':
                statusFilter = 'Registered';
                break;
            case '2':
                statusFilter = 'Round1';
                break;
            case '3':
                statusFilter = 'Round2';
                break;
        }

        const teams = await Team.find({
            isActive: true,
            competitionStatus: statusFilter
        })
            .select('-password')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            data: {
                teams: teams.map(team => ({
                    _id: team._id,
                    teamName: team.teamName,
                    members: team.members,
                    leader: team.leader,
                    competitionStatus: team.competitionStatus,
                    scores: team.scores,
                    registrationDate: team.registrationDate
                }))
            }
        });

    } catch (error) {
        console.error('Get round teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching round teams'
        });
    }
};

// @desc    Process round selection (Admin only)
// @route   POST /api/admin/round/:roundNumber/select
// @access  Private (Admin)
const processRoundSelection = async (req, res) => {
    try {
        const { roundNumber } = req.params;
        const { selectedTeamIds } = req.body;
        const validRounds = ['1', '2', '3'];

        if (!validRounds.includes(roundNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid round number'
            });
        }

        if (!Array.isArray(selectedTeamIds)) {
            return res.status(400).json({
                success: false,
                message: 'Selected team IDs must be an array'
            });
        }

        let nextStatus;
        switch (roundNumber) {
            case '1':
                nextStatus = 'Round2';
                break;
            case '2':
                nextStatus = 'Round3';
                break;
            case '3':
                nextStatus = 'Selected';
                break;
        }

        // Get current round status for filtering
        let currentStatus;
        switch (roundNumber) {
            case '1':
                currentStatus = 'Registered';
                break;
            case '2':
                currentStatus = 'Round1';
                break;
            case '3':
                currentStatus = 'Round2';
                break;
        }

        // Update selected teams to next status
        const selectedResult = await Team.updateMany(
            {
                _id: { $in: selectedTeamIds },
                competitionStatus: currentStatus,
                isActive: true
            },
            { competitionStatus: nextStatus }
        );

        // Update non-selected teams to eliminated
        const eliminatedResult = await Team.updateMany(
            {
                competitionStatus: currentStatus,
                isActive: true,
                _id: { $nin: selectedTeamIds }
            },
            { competitionStatus: 'Eliminated' }
        );

        res.status(200).json({
            success: true,
            message: `Round ${roundNumber} selection processed successfully`,
            data: {
                selectedCount: selectedResult.modifiedCount,
                eliminatedCount: eliminatedResult.modifiedCount,
                totalProcessed: selectedResult.modifiedCount + eliminatedResult.modifiedCount
            }
        });

    } catch (error) {
        console.error('Process round selection error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing round selection'
        });
    }
};

// @desc    Get team management data (Admin only)
// @route   GET /api/admin/teamManagement
// @access  Private (Admin)
const getTeamManagementData = async (req, res) => {
    try {
        const teams = await Team.find({ isActive: true })
            .select('-password')
            .sort({ registrationDate: -1 });

        const stats = {
            totalTeams: teams.length,
            registered: teams.filter(t => t.competitionStatus === 'Registered').length,
            round1: teams.filter(t => t.competitionStatus === 'Round1').length,
            round2: teams.filter(t => t.competitionStatus === 'Round2').length,
            round3: teams.filter(t => t.competitionStatus === 'Round3').length,
            completed: teams.filter(t => t.competitionStatus === 'Completed').length,
            hasCompletedCycle: teams.filter(t => t.hasCompletedCycle).length,
            resultsAnnounced: teams.filter(t => t.resultsAnnounced).length
        };

        res.status(200).json({
            success: true,
            data: {
                teams: teams.map(team => ({
                    _id: team._id,
                    teamName: team.teamName,
                    members: team.members,
                    leader: team.leader,
                    competitionStatus: team.competitionStatus,
                    hasCompletedCycle: team.hasCompletedCycle,
                    resultsAnnounced: team.resultsAnnounced,
                    scores: team.scores,
                    registrationDate: team.registrationDate
                })),
                stats
            }
        });

    } catch (error) {
        console.error('Get team management data error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching team management data'
        });
    }
};

// Apply new routes
router.post('/resetTeam/:teamId', adminAuth, resetTeam);
router.patch('/updateStatus/:teamId', adminAuth, updateTeamStatusNew);
router.post('/announceResults', adminAuth, announceResults);
router.get('/teamManagement', adminAuth, getTeamManagementData);
router.get('/round/:roundNumber/teams', adminAuth, getRoundTeams);
router.post('/round/:roundNumber/select', adminAuth, processRoundSelection);

export default router;
