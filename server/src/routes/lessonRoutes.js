import express from 'express';
import { getAllLessons, getLessonById, createLesson, updateLesson, deleteLesson } from '../controllers/lessonController.js';
import * as noteController from '../controllers/noteController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import * as questionController from '../controllers/questionController.js';

const { createNote, getNotes, deleteNote } = noteController;
const router = express.Router();

// Protezione di tutte le routes successive
router.use(protect);

// GET all lessons
router.get('/', getAllLessons);

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
router.post('/:id/notes', createNote);

// GET all notes for a lesson
router.get('/:id/notes', getNotes);

// DELETE note by ID
router.delete('/:id/notes/:noteId', deleteNote); 

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