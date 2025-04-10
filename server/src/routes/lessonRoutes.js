const express = require('express');
const lessonController = require('../controllers/lessonController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protezione di tutte le routes
router.use(authController.protect);

// Routes per gli utenti iscritti
router.get('/', lessonController.getLessons);
router.get('/:id', lessonController.getLesson);
router.patch('/:id/watch', lessonController.updateWatchProgress);
router.get('/:id/resources', lessonController.getLessonResources);
router.get('/:id/video-token', lessonController.getVideoToken);

// Routes solo per admin
router.use(authController.restrictTo('admin'));
router.post('/', lessonController.createLesson);
router.patch('/:id', lessonController.updateLesson);
router.delete('/:id', lessonController.deleteLesson);
router.patch('/:id/publish', lessonController.publishLesson);
router.patch('/:id/order', lessonController.updateLessonOrder);

module.exports = router;