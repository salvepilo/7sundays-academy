const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Route per la registrazione e il login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Route protetta per ottenere i dati dell'utente corrente
router.get('/me', authController.protect, authController.getMe);

module.exports = router;