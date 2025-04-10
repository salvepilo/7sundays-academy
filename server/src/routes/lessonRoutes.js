import express from 'express';
import lessonController from '../controllers/lessonController.js';
import noteController from '../controllers/noteController.js';
import authController from '../controllers/authController.js';
import questionController from '../controllers/questionController.js';

const router = express.Router();

// Protezione di tutte le routes successive
router.use(authController.protect);

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

// POST new note for a lesson
router.post('/:id/notes', noteController.createNote);

// GET all notes for a lesson
router.get('/:id/notes', noteController.getNotes);

// DELETE note by ID
router.delete('/:id/notes/:noteId', noteController.deleteNote); 

// POST new question for a lesson
router.post('/:id/questions', questionController.createQuestion);

// GET all questions for a lesson
router.get('/:id/questions', questionController.getQuestions);

// POST new answer for a question
router.post('/:id/questions/:questionId/answers', questionController.createAnswer);

// DELETE question by ID
router.delete('/:id/questions/:questionId', questionController.deleteQuestion);

// DELETE answer by ID
router.delete('/:id/questions/:questionId/answers/:answerId', questionController.deleteAnswer);


export default router;