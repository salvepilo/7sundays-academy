import express from 'express';
import {
  getAllContacts,
  getContact,
  sendContactRequest,
  handleContactRequest,
  getSentRequests,
  getReceivedRequests,
  sendMessage,
  getConversation,
} from '../controllers/networkingController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protezione di tutte le routes - solo utenti autenticati
router.use(protect);

// Routes per i contatti
router.route('/contacts')
  .get(getAllContacts);

router.route('/contacts/:id')
  .get(getContact);

router.route('/contacts/:id/request')
  .post(sendContactRequest);

// Routes per le richieste di contatto
router.route('/requests/sent')
  .get(getSentRequests);

router.route('/requests/received')
  .get(getReceivedRequests);

router.route('/requests/:id')
  .patch(handleContactRequest);

// Routes per i messaggi
router.route('/messages')
  .post(sendMessage);

router.route('/messages/:contactId')
  .get(getConversation);

export default router;