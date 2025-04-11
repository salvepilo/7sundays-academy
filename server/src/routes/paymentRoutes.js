import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createCheckoutSession, verifyPaymentSession } from '../controllers/paymentController.js';
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Rotte protette (richiedono autenticazione)
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify-session/:sessionId', protect, verifyPaymentSession);

// Rotta webhook (non richiede autenticazione ma verifica la firma)
router.post('/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

export default router;