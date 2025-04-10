import express from 'express';
import { getAllLessons, getLessonById, createLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import { createNote, getNotes, deleteNote } from '../controllers/noteController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import { createQuestion, getQuestions, createAnswer, deleteQuestion, deleteAnswer } from '../controllers/questionController.js';
  
const router = express.Router();

// Protezione di tutte le routes successive
router.use(authController.protect);

// GET all lessons
router.get('/', lessonController.getAllLessons);

//GET lesson by ID
router.get('/:id', getLessonById);

// POST new lesson
router.use(restrictTo('admin'));
router.post('/', createLesson);

// PUT update lesson by ID
router.put('/:id', updateLesson);

// DELETE lesson by ID
router.delete('/:id', deleteLesson);
router.use(restrictTo('user','admin'));

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