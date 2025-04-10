import express from "express";
import { getAllCourses, getCourse, enrollInCourse, updateProgress, getEnrolledCourses, generateCertificate, createCourse, updateCourse, addLessonToCourse, removeLessonFromCourse, deleteCourse, publishCourse, getCourseStats } from '../controllers/courseController.js';
import { protect, restrictTo } from '../controllers/authController.js';

  
const router = express.Router();

// Route pubbliche
router.get('/', getAllCourses);
router.get('/:id', getCourse);

// Route protette (richiede autenticazione)
router.use(protect);

// Iscrizione e progresso
router.post('/:id/enroll', enrollInCourse);
router.patch('/:id/progress', updateProgress);
router.get('/enrolled/my', getEnrolledCourses);
router.get('/:id/certificate', generateCertificate);

// Route solo per admin
router.use(restrictTo('admin'));

router.post('/', createCourse);
router.patch('/:id', updateCourse);
router.post('/:courseId/lessons/:lessonId', addLessonToCourse);
router.delete('/:courseId/lessons/:lessonId', removeLessonFromCourse);

router.delete('/:id', deleteCourse);
router.patch('/:id/publish', publishCourse);

router.get('/stats/dashboard', getCourseStats);

export default router;
