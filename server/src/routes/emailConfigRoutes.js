import express from 'express'; 
import { testEmailConfig, getActiveEmailConfig, activateEmailConfig, getAllEmailConfigs, createEmailConfig, getEmailConfig, updateEmailConfig, deleteEmailConfig } from '../controllers/emailConfigController.mjs';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protezione di tutte le routes - solo utenti autenticati
router.use(protect);

// Restrizione a solo admin
router.use(restrictTo('admin'));

// Test della configurazione email
router.post('/test', testEmailConfig);

// Ottieni la configurazione attiva
router.get('/active', getActiveEmailConfig);

// Attiva una configurazione specifica
router.patch('/:id/activate', activateEmailConfig);

// Routes CRUD standard
router.route('/')
  .get(getAllEmailConfigs)
  .post(createEmailConfig);

router.route('/:id')
  .get(getEmailConfig)
  .patch(updateEmailConfig)
  .delete(deleteEmailConfig);

export default router;