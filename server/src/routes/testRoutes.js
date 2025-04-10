import express from 'express';
import testController from '../controllers/testController.js';
import authController from '../controllers/authController.js';
 
const router = express.Router({ mergeParams: true });

// Protezione di tutte le routes
router.use(authController.protect);

// Routes per gli utenti iscritti
router.get('/',testController.getAllTests);
router.get('/:id',testController.getTest);
router.post('/:id/attempt',testController.startTestAttempt);
router.patch('/:id/attempt/:attemptId',testController.submitTestAttempt);
router.get('/attempts/my',testController.getUserTestAttempts);
router.get('/attempt/:attemptId',testController.getTestAttemptDetails);

// Routes solo per admin
router.use(authController.restrictTo('admin'));
router.post('/', testController.createTest);
router.patch('/:id', testController.updateTest);
router.delete('/:id', testController.deleteTest);
router.patch('/:id/publish', testController.publishTest);
router.get('/stats/dashboard', testController.getTestStats);
export default router;