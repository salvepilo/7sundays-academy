import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import courseRoutes from './courseRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import emailConfigRoutes from './emailConfigRoutes.js';
import networkingRoutes from './networkingRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/email-config', emailConfigRoutes);
router.use('/networking', networkingRoutes);

export default router; 