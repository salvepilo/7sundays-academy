import express from 'express';
import { signup, login, updatePassword, forgotPassword, resetPassword, protect, restrictTo, getMe } from '../controllers/authController.js';

const router = express.Router();

// Route per la registrazione e il login
router.post('/signup', signup);
router.post('/login', login);

// Route per il reset della password
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Route protetta per ottenere i dati dell'utente corrente
router.get('/me', protect, getMe);

export default router;
