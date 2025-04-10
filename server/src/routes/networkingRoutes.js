const express = require('express');
const networkingController = require('../controllers/networkingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protezione di tutte le routes
router.use(authController.protect);

// Routes per il networking
router.get('/contacts', networkingController.getContacts);
router.post('/contacts', networkingController.createContact);
router.patch('/contacts/:id', networkingController.updateContact);
router.delete('/contacts/:id', networkingController.deleteContact);

router.get('/contacts/:id', networkingController.getContactDetails);
router.post('/contacts/search', networkingController.searchContacts);
router.post('/contacts/request', networkingController.sendContactRequest);
router.patch('/contacts/request/:id/accept', networkingController.acceptContactRequest);
router.patch('/contacts/request/:id/reject', networkingController.rejectContactRequest);
router.get('/contacts/requests/pending', networkingController.getPendingRequests);

// Routes per i messaggi
router.get('/messages/:contactId', networkingController.getMessages);
router.post('/messages/:contactId', networkingController.sendMessage);
router.patch('/messages/:messageId/read', networkingController.markMessageAsRead);
router.delete('/messages/:messageId', networkingController.deleteMessage);

// Routes solo per admin
router.use(authController.restrictTo('admin'));
router.get('/stats/dashboard', networkingController.getNetworkingStats);

module.exports = router;