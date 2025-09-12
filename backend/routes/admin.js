import express from 'express';
import Team from '../models/Team.js';
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

        const validStatuses = ['registered', 'round1_completed', 'round2_completed', 'round3_completed', 'disqualified'];

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
// @route   POST /api/admin/announce/:round
// @access  Private (Admin)
const announceRoundResults = async (req, res) => {
    try {
        const { round } = req.params;
        const validRounds = ['1', '2', '3'];

        if (!validRounds.includes(round)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid round number'
            });
        }

        // Here you would implement the logic to announce results
        // For now, just return success
        res.status(200).json({
            success: true,
            message: `Round ${round} results announced successfully`
        });

    } catch (error) {
        console.error('Announce round results error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while announcing round results'
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

        // Deactivate any existing code for this round
        await RoundCodes.updateMany(
            { round: parseInt(round) },
            { isActive: false }
        );

        // Create new active code
        const newCode = new RoundCodes({
            round: parseInt(round),
            code: code.trim(),
            isActive: true,
            usageCount: 0,
            completionCount: 0
        });

        await newCode.save();

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

router.put('/teams/:id/status', adminAuth, updateTeamStatus);
router.post('/announce/:round', adminAuth, announceRoundResults);
router.post('/start/:round', adminAuth, startRound);
router.get('/stats', adminAuth, getCompetitionStats);
router.get('/round-codes', adminAuth, getRoundCodes);
router.post('/round-codes', adminAuth, setRoundCode);
router.delete('/round-codes/:round', adminAuth, resetRoundCode);

export default router;
