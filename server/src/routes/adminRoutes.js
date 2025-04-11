import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getRecentActivities
} from '../controllers/adminController.js';

const router = express.Router();

// Admin dashboard routes
router.get('/stats', protect, admin, getDashboardStats);
router.get('/activities', protect, admin, getRecentActivities);

export default router; 