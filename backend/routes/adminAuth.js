import express from 'express';
import { adminLogin, adminLogout, validateAdminToken } from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin authentication routes
router.post('/login', adminLogin);
router.post('/logout', adminAuth, adminLogout);
router.get('/validate', adminAuth, validateAdminToken);

export default router;
