import express from 'express';
import { getAllTests, getTest, startTestAttempt, submitTestAttempt, getUserTestAttempts, getTestAttemptDetails, createTest, updateTest, deleteTest, publishTest, getTestStats } from '../controllers/testController.js';
import { protect, restrictTo } from '../controllers/authController.js';
 
const router = express.Router({ mergeParams: true });

// Protezione di tutte le routes
router.use(protect);

// Routes per gli utenti iscritti
router.get('/',getAllTests);
router.get('/:id',getTest);
router.post('/:id/attempt',startTestAttempt);
router.patch('/:id/attempt/:attemptId',submitTestAttempt);
router.get('/attempts/my',getUserTestAttempts);
router.get('/attempt/:attemptId',getTestAttemptDetails);

// Routes solo per admin
router.use(restrictTo('admin'));
router.post('/', createTest);
router.patch('/:id', updateTest);
router.delete('/:id', deleteTest);
router.patch('/:id/publish', publishTest);
router.get('/stats/dashboard', getTestStats);
export default router;