import express from 'express';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// Aptitude questions data
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

// Get aptitude question
router.get('/apt/:step', (req, res) => {
    const step = parseInt(req.params.step);
    const question = aptitudeQuestions[step];

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
});

// Submit aptitude answer
router.post('/apt/answer', async (req, res) => {
    try {
        const { teamId, step, selected } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const question = aptitudeQuestions[step];
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const questionKey = `q${step + 1}`;
        const attemptKey = `q${step + 1}`;

        // Check if already completed
        if (team.completedQuestions[questionKey]) {
            return res.status(400).json({ error: 'Question already completed' });
        }

        // Check attempt limit
        if (team.aptitudeAttempts[attemptKey] >= 2) {
            return res.status(400).json({ error: 'Maximum attempts reached for this question' });
        }

        const correct = selected === question.correct;

        // Set start time on first quiz
        if (step === 0 && !team.startTime) {
            team.startTime = new Date();
        }

        // Increment attempt count
        team.aptitudeAttempts[attemptKey] += 1;

        let score = 0;
        if (correct) {
            // 2 points on first attempt, 1 point on second
            score = team.aptitudeAttempts[attemptKey] === 1 ? 2 : 1;
            team.scores[questionKey] = score;
            team.completedQuestions[questionKey] = true;

            // Sequential unlocking: Only unlock the immediate next question
            if (step === 0) { // Q1 completed - unlock Q4 (Debug)
                team.unlockedQuestions.q4 = true;
            } else if (step === 1) { // Q2 completed - unlock Q5 (Trace)
                team.unlockedQuestions.q5 = true;
            } else if (step === 2) { // Q3 completed - unlock Q6 (Program)
                team.unlockedQuestions.q6 = true;
            }
        } else if (team.aptitudeAttempts[attemptKey] === 2) {
            // No score on a failed second attempt
            score = 0;
            team.scores[questionKey] = score;
            team.completedQuestions[questionKey] = true;

            // Still unlock next question even if failed
            if (step === 0) { // Q1 completed - unlock Q4 (Debug)
                team.unlockedQuestions.q4 = true;
            } else if (step === 1) { // Q2 completed - unlock Q5 (Trace)
                team.unlockedQuestions.q5 = true;
            } else if (step === 2) { // Q3 completed - unlock Q6 (Program)
                team.unlockedQuestions.q6 = true;
            }
        }

        // Update total score
        team.totalScore = Object.values(team.scores).reduce((sum, score) => sum + score, 0);

        await team.save();

        // Save submission
        const submission = new Submission({
            team: teamId,
            questionNumber: questionKey,
            questionType: 'aptitude',
            step: 0, // Aptitude questions use step 0
            challengeType: 'aptitude',
            originalQuestion: question.question,
            userSolution: selected.toString(),
            timeTaken: 0, // Not applicable for aptitude
            attemptNumber: team.aptitudeAttempts[attemptKey],
            isCorrect: correct,
            score: score
        });

        await submission.save();

        res.json({
            correct,
            score,
            attemptsLeft: 2 - team.aptitudeAttempts[attemptKey],
            unlockedQuestions: team.unlockedQuestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit coding solution
router.post('/code/submit', async (req, res) => {
    try {
        const { teamId, challengeType, code, timeTaken, isAutoSave = false } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
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
        if (!team.unlockedQuestions[questionNumber]) {
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
            // No automatic scoring for coding challenges, score is always 0
            isCorrect = false;
            score = 0;

            // Update team scores and completion status
            team.scores[questionNumber] = score;
            team.completedQuestions[questionNumber] = true;
            team.totalScore = Object.values(team.scores).reduce((sum, score) => sum + score, 0);

            // Sequential unlocking: Unlock next aptitude question when coding challenge is completed
            if (challengeType === 'debug') { // Q4 completed - unlock Q2
                team.unlockedQuestions.q2 = true;
            } else if (challengeType === 'trace') { // Q5 completed - unlock Q3
                team.unlockedQuestions.q3 = true;
            }

            // Check if all questions are completed
            const allCompleted = Object.values(team.completedQuestions).every(completed => completed);
            if (allCompleted) {
                team.isQuizCompleted = true;
                team.endTime = new Date();
                team.totalTimeTaken = Math.floor((team.endTime - team.startTime) / 1000);
            }

            await team.save();
        }

        // Save submission
        const submission = new Submission({
            team: teamId,
            questionNumber: questionNumber,
            questionType: challengeType,
            step: step,
            challengeType: challengeType,
            originalQuestion: originalQuestions[challengeType],
            userSolution: code,
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
            isQuizCompleted: team.isQuizCompleted,
            totalScore: team.totalScore
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Auto-save coding solution
router.post('/code/autosave', async (req, res) => {
    try {
        const { teamId, challengeType, code, timeTaken } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Map challenge type to question number and step
        const challengeMap = {
            'debug': { questionNumber: 'q4', step: 1 },
            'trace': { questionNumber: 'q5', step: 2 },
            'program': { questionNumber: 'q6', step: 3 }
        };

        const { questionNumber, step } = challengeMap[challengeType];

        // Check if question is unlocked
        if (!team.unlockedQuestions[questionNumber]) {
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
            questionNumber: questionNumber,
            questionType: challengeType,
            step: step,
            challengeType: challengeType,
            originalQuestion: originalQuestions[challengeType],
            userSolution: code,
            timeTaken: timeTaken,
            attemptNumber: 1,
            isCorrect: false,
            score: 0,
            isAutoSaved: true
        });

        await submission.save();

        res.json({ success: true, message: 'Progress auto-saved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get team progress
router.get('/team/:teamId/progress', async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({
            team: {
                name: team.teamName,
                startTime: team.startTime,
                endTime: team.endTime,
                totalTimeTaken: team.totalTimeTaken,
                isQuizCompleted: team.isQuizCompleted,
                totalScore: team.totalScore,
                unlockedQuestions: team.unlockedQuestions,
                completedQuestions: team.completedQuestions,
                scores: team.scores,
                aptitudeAttempts: team.aptitudeAttempts
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
