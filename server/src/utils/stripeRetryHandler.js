import stripe from '../config/stripe.js';
import stripeLogger from './stripeLogger.js';

class StripeRetryHandler {
  constructor() {
    this.maxRetries = 3;
    this.retryDelays = [1000, 5000, 15000]; // Ritardi in millisecondi
  }

  async handleFailedPayment(paymentIntentId, attempt = 0) {
    try {
      if (attempt >= this.maxRetries) {
        await stripeLogger.logTransaction('RETRY_EXHAUSTED', {
          paymentIntentId,
          attempts: attempt,
          status: 'failed'
        });
        return { success: false, error: 'Max retry attempts reached' };
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'requires_payment_method') {
        await new Promise(resolve => setTimeout(resolve, this.retryDelays[attempt]));

        const retryAttempt = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentIntent.last_payment_error?.payment_method?.id
        });

        await stripeLogger.logTransaction('RETRY_ATTEMPT', {
          paymentIntentId,
          attempt: attempt + 1,
          status: retryAttempt.status
        });

        if (retryAttempt.status === 'succeeded') {
          return { success: true, paymentIntent: retryAttempt };
        }

        return this.handleFailedPayment(paymentIntentId, attempt + 1);
      }

      return { success: false, error: 'Payment intent not retriable' };
    } catch (error) {
      await stripeLogger.logTransaction('RETRY_ERROR', {
        paymentIntentId,
        attempt,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  async handleWebhookFailure(event, error) {
    await stripeLogger.logTransaction('WEBHOOK_FAILURE', {
      eventId: event.id,
      type: event.type,
      error: error.message
    });

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      return this.handleFailedPayment(paymentIntent.id);
    }

    return { success: false, error: 'Unhandled webhook event type' };
  }

  async validatePaymentSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        return { success: true, session };
      }

      if (session.payment_status === 'unpaid' && session.payment_intent) {
        return this.handleFailedPayment(session.payment_intent);
      }

      return { success: false, error: 'Invalid session status' };
    } catch (error) {
      await stripeLogger.logTransaction('SESSION_VALIDATION_ERROR', {
        sessionId,
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }
}

export default new StripeRetryHandler();