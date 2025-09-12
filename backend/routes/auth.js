import express from 'express';
import {
    registerTeam,
    loginTeam,
    getTeamProfile,
    updateTeamProfile,
    changePassword,
    logoutTeam
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
    validateRegistration,
    validateLogin,
    validateTeamUpdate
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, registerTeam);
router.post('/login', validateLogin, loginTeam);

// Protected routes
router.get('/profile', protect, getTeamProfile);
router.put('/profile', protect, validateTeamUpdate, updateTeamProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutTeam);

export default router;
