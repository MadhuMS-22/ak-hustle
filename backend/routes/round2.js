import express from 'express';
import mongoose from 'mongoose';
import Round2Team from '../models/Round2Team.js';
import Submission from '../models/Submission.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Aptitude questions data (matching quiz3)
const aptitudeQuestions = {
    0: {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct: 1
    },
    1: {
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correct: 1
    },
    2: {
        question: "What does 'git commit' do?",
        options: ["Stages changes", "Saves changes to repository", "Creates a new branch", "Merges branches"],
        correct: 1
    }
};

// @desc    Get aptitude question
// @route   GET /api/round2/apt/:step
// @access  Public
const getAptitudeQuestion = (req, res) => {
    const step = parseInt(req.params.step);
    const question = aptitudeQuestions[step];

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
};

// @desc    Create a new Round 2 team entry
// @route   POST /api/round2/teams
// @access  Private
const createRound2Team = async (req, res) => {
    try {
        const { teamName } = req.body;
        const teamId = req.team._id; // Use authenticated team's ID

        // Check if team already has a Round 2 entry
        const existingEntry = await Round2Team.findOne({ teamId });
        if (existingEntry) {
            return res.status(200).json({
                success: true,
                data: existingEntry
            });
        }

        const round2Team = new Round2Team({
            teamId,
            teamName: teamName || req.team.teamName
        });

        await round2Team.save();

        res.status(201).json({
            success: true,
            data: round2Team
        });
    } catch (error) {
        console.error('Create Round 2 team error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating Round 2 team entry'
        });
    }
};

// @desc    Get Round 2 team progress
// @route   GET /api/round2/teams/:teamId
// @access  Private
const getRound2TeamProgress = async (req, res) => {
    try {
        const { teamId } = req.params;

        const round2Team = await Round2Team.findOne({
            teamId: new mongoose.Types.ObjectId(teamId)
        });

        if (!round2Team) {
            return res.status(404).json({
                success: false,
                message: 'Round 2 team entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: round2Team
        });
    } catch (error) {
        console.error('Get Round 2 team progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching Round 2 team progress'
        });
    }
};

// @desc    Submit aptitude answer
// @route   POST /api/round2/aptitude/answer
// @access  Private
const submitAptitudeAnswer = async (req, res) => {
    try {
        const { teamId, questionIndex, answer } = req.body;

        const round2Team = await Round2Team.findOne({
            teamId: new mongoose.Types.ObjectId(teamId)
        });
        if (!round2Team) {
            return res.status(404).json({
                success: false,
                message: 'Round 2 team entry not found'
            });
        }

        const question = aptitudeQuestions[questionIndex];
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const questionKey = `q${questionIndex + 1}`;
        const attemptKey = `q${questionIndex + 1}`;

        // Check if already completed
        if (round2Team.completedQuestions[questionKey]) {
            return res.status(400).json({ error: 'Question already completed' });
        }

        // Check attempt limit
        if (round2Team.aptitudeAttempts[attemptKey] >= 2) {
            return res.status(400).json({ error: 'Maximum attempts reached for this question' });
        }

        const correct = parseInt(answer) === question.correct;

        // Set start time on first quiz
        if (questionIndex === 0 && !round2Team.startTime) {
            round2Team.startTime = new Date();
        }

        // Increment attempt count
        round2Team.aptitudeAttempts[attemptKey] += 1;

        let score = 0;
        if (correct) {
            // Full marks if correct on first attempt, half marks if correct on second attempt
            score = round2Team.aptitudeAttempts[attemptKey] === 1 ? 10 : 5;
            round2Team.scores[questionKey] = score;
            round2Team.completedQuestions[questionKey] = true;

            // Sequential unlocking: Only unlock the immediate next question
            if (questionIndex === 0) { // Q1 completed - unlock Q4 (Debug Q1)
                round2Team.unlockedQuestions.q4 = true;
            } else if (questionIndex === 1) { // Q2 completed - unlock Q5 (Output Q2)
                round2Team.unlockedQuestions.q5 = true;
            } else if (questionIndex === 2) { // Q3 completed - unlock Q6 (Program Q3)
                round2Team.unlockedQuestions.q6 = true;
            }
        } else if (round2Team.aptitudeAttempts[attemptKey] === 2) {
            // Half marks for failed attempts
            score = 2.5;
            round2Team.scores[questionKey] = score;
            round2Team.completedQuestions[questionKey] = true;

            // Still unlock next question even if failed
            if (questionIndex === 0) { // Q1 completed - unlock Q4 (Debug Q1)
                round2Team.unlockedQuestions.q4 = true;
            } else if (questionIndex === 1) { // Q2 completed - unlock Q5 (Output Q2)
                round2Team.unlockedQuestions.q5 = true;
            } else if (questionIndex === 2) { // Q3 completed - unlock Q6 (Program Q3)
                round2Team.unlockedQuestions.q6 = true;
            }
        }

        // Update total score
        round2Team.totalScore = Object.values(round2Team.scores).reduce((sum, score) => sum + score, 0);

        await round2Team.save();

        // Save submission
        const submission = new Submission({
            team: teamId,
            round2Team: round2Team._id,
            questionNumber: questionKey,
            questionType: 'aptitude',
            step: 0, // Aptitude questions use step 0
            challengeType: 'aptitude',
            originalQuestion: question.question,
            userSolution: answer.toString(),
            timeTaken: 0, // Not applicable for aptitude
            attemptNumber: round2Team.aptitudeAttempts[attemptKey],
            isCorrect: correct,
            score: score
        });

        await submission.save();

        res.json({
            correct,
            score,
            attemptsLeft: 2 - round2Team.aptitudeAttempts[attemptKey],
            unlockedQuestions: round2Team.unlockedQuestions
        });
    } catch (error) {
        console.error('Submit aptitude answer error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Submit coding solution
// @route   POST /api/round2/coding/submit
// @access  Private
const submitCodingSolution = async (req, res) => {
    try {
        const { teamId, challengeType, solution, timeTaken, isAutoSave = false } = req.body;

        const round2Team = await Round2Team.findOne({
            teamId: new mongoose.Types.ObjectId(teamId)
        });
        if (!round2Team) {
            return res.status(404).json({ error: 'Round 2 team entry not found' });
        }

        // Validate challenge type
        if (!['debug', 'trace', 'program'].includes(challengeType)) {
            return res.status(400).json({ error: 'Invalid challenge type' });
        }

        // Map challenge type to question number and step
        const challengeMap = {
            'debug': { questionNumber: 'q4', step: 1 },
            'trace': { questionNumber: 'q5', step: 2 },
            'program': { questionNumber: 'q6', step: 3 }
        };

        const { questionNumber, step } = challengeMap[challengeType];

        // Check if question is unlocked
        if (!round2Team.unlockedQuestions[questionNumber]) {
            return res.status(400).json({ error: 'Question is locked. Complete the prerequisite aptitude question first.' });
        }

        // Enforce 5-minute cap
        const maxTime = 300; // 5 minutes in seconds
        const actualTimeTaken = Math.min(timeTaken, maxTime);

        // Define original questions for each challenge type
        const originalQuestions = {
            'debug': `#include <stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int i = 0; i <= 5; i++) {
        sum += arr[i];
    }
    
    printf("Sum: %d\\n", sum);
    return 0;
}`,
            'trace': `#include <stdio.h>

int mystery(int n) {
    if (n <= 1) return n;
    return mystery(n-1) + mystery(n-2);
}

int main() {
    int result = mystery(4);
    printf("Result: %d\\n", result);
    return 0;
}`,
            'program': `Write a C program to print the first n Fibonacci numbers.

Example:
Input: 5
Output: 0 1 1 2 3`
        };

        // Calculate score based on code quality and time taken
        let score = 0;
        let isCorrect = false;

        if (!isAutoSave) {
            // Simple scoring logic - can be enhanced with actual code evaluation
            if (challengeType === 'debug') {
                // Check if the bug is fixed (i < 5 instead of i <= 5)
                isCorrect = solution.includes('i < 5') && !solution.includes('i <= 5');
                score = isCorrect ? 15 : 0;
            } else if (challengeType === 'trace') {
                // Check if they provided the correct trace or explanation
                isCorrect = solution.length > 50; // Basic check for substantial answer
                score = isCorrect ? 15 : 0;
            } else if (challengeType === 'program') {
                // Check if they provided a working program
                isCorrect = solution.includes('fibonacci') || solution.includes('fib') || solution.length > 100;
                score = isCorrect ? 15 : 0;
            }

            // Update team scores and completion status
            round2Team.scores[questionNumber] = score;
            round2Team.completedQuestions[questionNumber] = true;
            round2Team.totalScore = Object.values(round2Team.scores).reduce((sum, score) => sum + score, 0);

            // Sequential unlocking: Unlock next aptitude question when coding challenge is completed
            if (challengeType === 'debug') { // Q4 (Debug Q1) completed - unlock Q2
                round2Team.unlockedQuestions.q2 = true;
            } else if (challengeType === 'trace') { // Q5 (Output Q2) completed - unlock Q3
                round2Team.unlockedQuestions.q3 = true;
            } else if (challengeType === 'program') { // Q6 (Program Q3) completed - quiz finished
                // No more questions to unlock
            }

            // Check if all questions are completed
            const allCompleted = Object.values(round2Team.completedQuestions).every(completed => completed);
            if (allCompleted) {
                round2Team.isQuizCompleted = true;
                round2Team.endTime = new Date();
                round2Team.totalTimeTaken = Math.floor((round2Team.endTime - round2Team.startTime) / 1000);
            }

            await round2Team.save();
        }

        // Save submission
        const submission = new Submission({
            team: teamId,
            round2Team: round2Team._id,
            questionNumber: questionNumber,
            questionType: challengeType,
            step: step,
            challengeType: challengeType,
            originalQuestion: originalQuestions[challengeType],
            userSolution: solution,
            timeTaken: actualTimeTaken,
            attemptNumber: 1,
            isCorrect: isCorrect,
            score: score,
            isAutoSaved: isAutoSave
        });

        await submission.save();

        res.json({
            success: true,
            score: score,
            isCorrect: isCorrect,
            isQuizCompleted: round2Team.isQuizCompleted,
            totalScore: round2Team.totalScore
        });
    } catch (error) {
        console.error('Submit coding solution error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Auto-save coding solution
// @route   POST /api/round2/coding/autosave
// @access  Private
const autoSaveCodingSolution = async (req, res) => {
    try {
        const { teamId, challengeType, solution, timeTaken } = req.body;

        const round2Team = await Round2Team.findOne({
            teamId: new mongoose.Types.ObjectId(teamId)
        });
        if (!round2Team) {
            return res.status(404).json({ error: 'Round 2 team entry not found' });
        }

        // Map challenge type to question number and step
        const challengeMap = {
            'debug': { questionNumber: 'q4', step: 1 },
            'trace': { questionNumber: 'q5', step: 2 },
            'program': { questionNumber: 'q6', step: 3 }
        };

        const { questionNumber, step } = challengeMap[challengeType];

        // Check if question is unlocked
        if (!round2Team.unlockedQuestions[questionNumber]) {
            return res.status(400).json({ error: 'Question is locked' });
        }

        // Define original questions for each challenge type
        const originalQuestions = {
            'debug': `#include <stdio.h>

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int sum = 0;
    
    for (int i = 0; i <= 5; i++) {
        sum += arr[i];
    }
    
    printf("Sum: %d\\n", sum);
    return 0;
}`,
            'trace': `#include <stdio.h>

int mystery(int n) {
    if (n <= 1) return n;
    return mystery(n-1) + mystery(n-2);
}

int main() {
    int result = mystery(4);
    printf("Result: %d\\n", result);
    return 0;
}`,
            'program': `Write a C program to print the first n Fibonacci numbers.

Example:
Input: 5
Output: 0 1 1 2 3`
        };

        // Save auto-save submission
        const submission = new Submission({
            team: teamId,
            round2Team: round2Team._id,
            questionNumber: questionNumber,
            questionType: challengeType,
            step: step,
            challengeType: challengeType,
            originalQuestion: originalQuestions[challengeType],
            userSolution: solution,
            timeTaken: timeTaken,
            attemptNumber: 1,
            isCorrect: false,
            score: 0,
            isAutoSaved: true
        });

        await submission.save();

        res.json({ success: true, message: 'Progress auto-saved' });
    } catch (error) {
        console.error('Auto-save coding solution error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get team progress
// @route   GET /api/round2/team/:teamId/progress
// @access  Private
const getTeamProgress = async (req, res) => {
    try {
        const { teamId } = req.params;

        const round2Team = await Round2Team.findOne({
            teamId: new mongoose.Types.ObjectId(teamId)
        });
        if (!round2Team) {
            return res.status(404).json({ error: 'Round 2 team entry not found' });
        }

        res.json({
            team: {
                name: round2Team.teamName,
                startTime: round2Team.startTime,
                endTime: round2Team.endTime,
                totalTimeTaken: round2Team.totalTimeTaken,
                isQuizCompleted: round2Team.isQuizCompleted,
                totalScore: round2Team.totalScore,
                unlockedQuestions: round2Team.unlockedQuestions,
                completedQuestions: round2Team.completedQuestions,
                scores: round2Team.scores,
                aptitudeAttempts: round2Team.aptitudeAttempts
            }
        });
    } catch (error) {
        console.error('Get team progress error:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get Round 2 scores/leaderboard
// @route   GET /api/round2/scores
// @access  Public
const getRound2Scores = async (req, res) => {
    try {
        const scores = await Round2Team.find({ isQuizCompleted: true })
            .select('teamName totalScore totalTimeTaken startTime endTime completedQuestions')
            .sort({ totalScore: -1, totalTimeTaken: 1 });

        res.status(200).json({
            success: true,
            data: scores
        });
    } catch (error) {
        console.error('Get Round 2 scores error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching Round 2 scores'
        });
    }
};

// @desc    Get admin overview
// @route   GET /api/round2/admin/overview
// @access  Private
const getAdminOverview = async (req, res) => {
    try {
        const teams = await Round2Team.find()
            .select('teamName currentStep isQuizCompleted totalScore totalTimeTaken startTime endTime completedQuestions unlockedQuestions aptitudeAttempts')
            .sort({ totalScore: -1, totalTimeTaken: 1 });

        const stats = {
            totalTeams: teams.length,
            completedTeams: teams.filter(t => t.isQuizCompleted).length,
            averageScore: teams.length > 0 ? teams.reduce((sum, t) => sum + t.totalScore, 0) / teams.length : 0
        };

        res.status(200).json({
            success: true,
            data: {
                teams,
                stats
            }
        });
    } catch (error) {
        console.error('Get admin overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching admin overview'
        });
    }
};

// Apply routes
router.get('/apt/:step', getAptitudeQuestion);
router.post('/teams', protect, createRound2Team);
router.get('/teams/:teamId', protect, getRound2TeamProgress);
router.get('/team/:teamId/progress', protect, getTeamProgress);
router.post('/aptitude/answer', protect, submitAptitudeAnswer);
router.post('/coding/submit', protect, submitCodingSolution);
router.post('/coding/autosave', protect, autoSaveCodingSolution);
router.get('/scores', getRound2Scores);
router.get('/admin/overview', protect, getAdminOverview);

export default router;