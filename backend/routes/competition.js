import express from 'express';
import Team from '../models/Team.js';
import { protect, checkRoundEligibility, checkNotDisqualified } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get competition leaderboard
// @route   GET /api/competition/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const teams = await Team.find({ isActive: true })
            .select('teamName members competitionStatus scores registrationDate')
            .sort({ 'scores.total': -1, registrationDate: 1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: {
                leaderboard: teams
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching leaderboard'
        });
    }
};

// @desc    Get team's competition status
// @route   GET /api/competition/status
// @access  Private
const getCompetitionStatus = async (req, res) => {
    try {
        const team = req.team;

        res.status(200).json({
            success: true,
            data: {
                team: {
                    teamName: team.teamName,
                    competitionStatus: team.competitionStatus,
                    scores: team.scores,
                    registrationDate: team.registrationDate,
                    lastLogin: team.lastLogin
                }
            }
        });
    } catch (error) {
        console.error('Get competition status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching competition status'
        });
    }
};

// @desc    Update team's competition status (Admin only - for now, any authenticated user)
// @route   PUT /api/competition/status
// @access  Private
const updateCompetitionStatus = async (req, res) => {
    try {
        const { status, scores } = req.body;
        const teamId = req.team._id;

        const validStatuses = ['registered', 'round1_completed', 'round2_completed', 'round3_completed', 'disqualified'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid competition status'
            });
        }

        const updateData = {};
        if (status) updateData.competitionStatus = status;
        if (scores) {
            updateData.scores = { ...req.team.scores, ...scores };
            updateData.scores.total = (updateData.scores.round1 || 0) +
                (updateData.scores.round2 || 0) +
                (updateData.scores.round3 || 0);
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            updateData,
            { new: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Competition status updated successfully',
            data: {
                team: {
                    teamName: updatedTeam.teamName,
                    competitionStatus: updatedTeam.competitionStatus,
                    scores: updatedTeam.scores
                }
            }
        });

    } catch (error) {
        console.error('Update competition status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating competition status'
        });
    }
};

// @desc    Verify Round 3 access code
// @route   POST /api/competition/verify-round3-code
// @access  Private
const verifyRound3Code = async (req, res) => {
    try {
        const { code } = req.body;
        const team = req.team;

        // Note: Round 2 completion constraint removed - any authenticated team can access Round 3 with correct code

        // Verify the access code
        if (code && code.trim().toLowerCase() === 'x24') {
            res.status(200).json({
                success: true,
                message: 'Access code verified successfully',
                data: {
                    verified: true,
                    teamName: team.teamName
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid access code'
            });
        }

    } catch (error) {
        console.error('Verify Round 3 code error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while verifying access code'
        });
    }
};

// @desc    Get competition statistics
// @route   GET /api/competition/stats
// @access  Public
const getCompetitionStats = async (req, res) => {
    try {
        const totalTeams = await Team.countDocuments({ isActive: true });
        const registeredTeams = await Team.countDocuments({
            isActive: true,
            competitionStatus: 'registered'
        });
        const round1Completed = await Team.countDocuments({
            isActive: true,
            competitionStatus: { $in: ['round1_completed', 'round2_completed', 'round3_completed'] }
        });
        const round2Completed = await Team.countDocuments({
            isActive: true,
            competitionStatus: { $in: ['round2_completed', 'round3_completed'] }
        });
        const round3Completed = await Team.countDocuments({
            isActive: true,
            competitionStatus: 'round3_completed'
        });

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalTeams,
                    registeredTeams,
                    round1Completed,
                    round2Completed,
                    round3Completed
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

// Apply routes
router.get('/leaderboard', getLeaderboard);
router.get('/stats', getCompetitionStats);
router.get('/status', protect, checkNotDisqualified, getCompetitionStatus);
router.put('/status', protect, checkNotDisqualified, updateCompetitionStatus);
router.post('/verify-round3-code', protect, checkNotDisqualified, verifyRound3Code);

export default router;
