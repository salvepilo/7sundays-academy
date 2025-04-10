<<<<<<< HEAD
const express = require("express");
const courseController = require("../controllers/courseController");
const coursesController = require("../controllers/coursesController");
const authController = require("../controllers/authController");
=======
import express from "express";
import courseController from "../controllers/courseController.js";
import authController from "../controllers/authController.js";
>>>>>>> 58881b648b92d5a093df0f6c53d6ccd8d2d27228
  
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
<<<<<<< HEAD
router.get('/stats/course', courseController.getCourseStats);
router.get('/stats/dashboard', coursesController.getDashboardStats);
module.exports = router;
=======
router.get('/stats/dashboard', courseController.getCourseStats);
router.get('/stats/dashboard', courseController.getDashboardStats); 
export default router;
>>>>>>> 58881b648b92d5a093df0f6c53d6ccd8d2d27228
