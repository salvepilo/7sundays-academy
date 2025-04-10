const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Route per la registrazione e il login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route per il reset della password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Route protetta per ottenere i dati dell'utente corrente
router.get('/me', authController.protect, authController.getMe);

module.exports = router;