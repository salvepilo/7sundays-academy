import express from 'express';
import * as networkingController from '../controllers/networkingController.js';
import * as authController from '../controllers/authController.js';
const { getContacts, createContact, updateContact, deleteContact, getContactDetails, searchContacts, sendContactRequest, acceptContactRequest, rejectContactRequest, getPendingRequests, getMessages, sendMessage, markMessageAsRead, deleteMessage, getNetworkingStats } = networkingController;
const { protect, restrictTo } = authController

const router = express.Router();

// Protezione di tutte le routes
router.use(protect);

// Routes per il networking
router.get('/contacts', getContacts);
router.post('/contacts', createContact);
router.patch('/contacts/:id', updateContact);
router.delete('/contacts/:id', deleteContact);
router.get('/contacts/:id', getContactDetails);
router.post('/contacts/search', searchContacts);
router.post('/contacts/request', sendContactRequest);
router.patch('/contacts/request/:id/accept', acceptContactRequest);
router.patch('/contacts/request/:id/reject', rejectContactRequest);
router.get('/contacts/requests/pending', getPendingRequests);

// Routes per i messaggi
router.get('/messages/:contactId', getMessages);
router.post('/messages/:contactId', sendMessage);
router.patch('/messages/:messageId/read', markMessageAsRead);
router.delete('/messages/:messageId', deleteMessage);

// Routes solo per admin
router.use(restrictTo('admin'));
router.get('/stats/dashboard', getNetworkingStats);

export default router;