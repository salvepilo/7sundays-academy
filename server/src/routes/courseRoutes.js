const express = require("express");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");
  
const router = express.Router();

// Route pubbliche
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Route protette (richiede autenticazione)
router.use(authController.protect);

// Iscrizione e progresso
router.post('/:id/enroll', courseController.enrollInCourse);
router.patch('/:id/progress', courseController.updateProgress);
router.get('/enrolled/my', courseController.getEnrolledCourses);
router.get('/:id/certificate', courseController.generateCertificate);

// Route solo per admin
router.use(authController.restrictTo('admin'));
router.post('/', courseController.createCourse);
router.patch('/:id', courseController.updateCourse);
router.post('/:courseId/lessons/:lessonId', courseController.addLessonToCourse);
router.delete('/:courseId/lessons/:lessonId', courseController.removeLessonFromCourse);

router.delete('/:id', courseController.deleteCourse);
router.patch('/:id/publish', courseController.publishCourse);
router.get('/stats/dashboard', courseController.getCourseStats);

module.exports = router;