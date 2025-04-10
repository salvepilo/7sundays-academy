const express = require('express');
const lessonController = require('../controllers/lessonController');

const router = express.Router();

// GET all lessons
router.get('/', lessonController.getAllLessons);

// GET lesson by ID
router.get('/:id', lessonController.getLessonById);

// POST new lesson
router.post('/', lessonController.createLesson);

// PUT update lesson by ID
router.put('/:id', lessonController.updateLesson);

// DELETE lesson by ID
router.delete('/:id', lessonController.deleteLesson);
module.exports = router;