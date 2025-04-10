const express = require('express');
const emailConfigController = require('../controllers/emailConfigController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protezione di tutte le routes - solo utenti autenticati
router.use(authController.protect);

// Restrizione a solo admin
router.use(authController.restrictTo('admin'));

// Test della configurazione email
router.post('/test', emailConfigController.testEmailConfig);

// Ottieni la configurazione attiva
router.get('/active', emailConfigController.getActiveEmailConfig);

// Attiva una configurazione specifica
router.patch('/:id/activate', emailConfigController.activateEmailConfig);

// Routes CRUD standard
router.route('/')
  .get(emailConfigController.getAllEmailConfigs)
  .post(emailConfigController.createEmailConfig);

router.route('/:id')
  .get(emailConfigController.getEmailConfig)
  .patch(emailConfigController.updateEmailConfig)
  .delete(emailConfigController.deleteEmailConfig);

module.exports = router;