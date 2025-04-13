import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getMonthlyStats,
  getCourseCompletionStats
} from '../controllers/adminController.js';

const router = express.Router();

// Admin dashboard routes
router.get('/stats', protect, admin, getDashboardStats);
router.get('/stats/monthly', protect, admin, getMonthlyStats);
router.get('/stats/completion', protect, admin, getCourseCompletionStats);

export default router; 