// backend/routes/round3.js
import express from 'express';
import { submitRound3, getRound3Scores, getAllRound3Results, updateRound3Score } from '../controllers/round3Controller.js';
import { protect, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Auth required for submitting scores
router.post("/submit", protect, submitRound3);

// Get all Round 3 scores (for admin dashboard)
router.get("/scores", getRound3Scores);

// Admin routes
router.get("/admin/results", adminAuth, getAllRound3Results);
router.post("/admin/update-score/:teamId", adminAuth, updateRound3Score);

export default router;
