// backend/controllers/round3Controller.js
import Team from '../models/Team.js';

export const submitRound3 = async (req, res) => {
    try {
        const { teamId, score, timeTaken, selectedProgram, questionOrder, questionOrderName, questionResults, individualQuestionScores } = req.body;

        // Prefer teamId from authenticated user if available
        const finalTeamId = teamId || (req.user && (req.user.teamId || req.user.id));
        if (!finalTeamId) return res.status(400).json({ message: "teamId required" });

        // Save to Team document (update fields for round3)
        const updated = await Team.findByIdAndUpdate(
            finalTeamId,
            {
                $set: {
                    round3Score: score,
                    round3Time: timeTaken,
                    round3Program: selectedProgram,
                    round3QuestionOrder: questionOrder,
                    round3QuestionOrderName: questionOrderName,
                    round3QuestionResults: questionResults,
                    round3IndividualScores: individualQuestionScores,
                    round3Completed: true,
                    round3SubmittedAt: new Date()
                }
            },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: "Team not found" });
        return res.json({ message: "Round 3 result saved", team: updated });
    } catch (err) {
        console.error("round3Controller.submitRound3:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const getRound3Scores = async (req, res) => {
    try {
        const teams = await Team.find({ round3Completed: true })
            .select('teamName round3Score round3Time round3SubmittedAt round3QuestionOrderName')
            .sort({ round3Score: -1, round3Time: 1 });

        return res.json(teams);
    } catch (err) {
        console.error("round3Controller.getRound3Scores:", err);
        return res.status(500).json({ error: err.message });
    }
};

// @desc    Get all Round 3 results for admin
// @route   GET /api/round3/admin/results
// @access  Private (Admin)
export const getAllRound3Results = async (req, res) => {
    try {
        const teams = await Team.find({ round3Completed: true })
            .select('teamName members leader round3Score round3Time round3SubmittedAt round3QuestionOrderName round3Program')
            .sort({ round3Score: -1, round3Time: 1 });

        res.status(200).json({
            success: true,
            data: {
                teams,
                count: teams.length
            }
        });
    } catch (error) {
        console.error('Get all Round 3 results error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching Round 3 results'
        });
    }
};

// @desc    Update Round 3 score for a team (Admin only)
// @route   POST /api/round3/admin/update-score/:teamId
// @access  Private (Admin)
export const updateRound3Score = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { score } = req.body;

        if (!score || isNaN(score) || score < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid score is required'
            });
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            {
                $set: {
                    round3Score: parseInt(score),
                    'scores.round3': parseInt(score)
                }
            },
            { new: true }
        ).select('teamName round3Score scores');

        if (!updatedTeam) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Update total score
        const totalScore = (updatedTeam.scores.round1 || 0) +
            (updatedTeam.scores.round2 || 0) +
            (updatedTeam.scores.round3 || 0);

        await Team.findByIdAndUpdate(teamId, { 'scores.total': totalScore });

        res.status(200).json({
            success: true,
            message: 'Round 3 score updated successfully',
            data: {
                team: updatedTeam,
                totalScore
            }
        });

    } catch (error) {
        console.error('Update Round 3 score error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating Round 3 score'
        });
    }
};