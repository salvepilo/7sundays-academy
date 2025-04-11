import stripe from '../config/stripe.js';
import Course from '../models/Course.js';
import stripeLogger from '../utils/stripeLogger.js';
import stripeRetryHandler from '../utils/stripeRetryHandler.js';

export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Verifica che il corso esista
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato'
      });
    }

    if (!course.stripePriceId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Configurazione di pagamento non disponibile per questo corso'
      });
    }

    // Crea la sessione di checkout
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: course.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/courses/${courseId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/courses/${courseId}`,
        customer_email: req.user.email,
        metadata: {
          courseId: courseId,
          userId: userId
        }
      });

      await stripeLogger.logTransaction('CHECKOUT_SESSION_CREATED', {
        sessionId: session.id,
        courseId,
        userId
      });

      res.status(200).json({
        status: 'success',
        data: {
          sessionId: session.id
        }
      });
    } catch (error) {
      await stripeLogger.logTransaction('CHECKOUT_SESSION_ERROR', {
        error: error.message,
        courseId,
        userId
      });
      res.status(500).json({
        status: 'error',
        message: 'Errore nella creazione della sessione di pagamento'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Errore interno del server'
    });
  }
};

export const verifyPaymentSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const validationResult = await stripeRetryHandler.validatePaymentSession(sessionId);
    
    if (!validationResult.success) {
      await stripeLogger.logTransaction('PAYMENT_VALIDATION_FAILED', {
        sessionId,
        error: validationResult.error
      });
      return res.status(400).json({
        status: 'fail',
        message: 'Errore nella validazione del pagamento'
      });
    }

    const session = validationResult.session;

    if (session.payment_status === 'paid') {
      await stripeLogger.logTransaction('PAYMENT_VALIDATION_SUCCESS', {
        sessionId: session.id,
        courseId: session.metadata.courseId,
        userId: session.metadata.userId
      });

      res.status(200).json({
        status: 'success',
        data: {
          paid: true,
          courseId: session.metadata.courseId
        }
      });
    } else {
      await stripeLogger.logTransaction('PAYMENT_VALIDATION_PENDING', {
        sessionId: session.id,
        courseId: session.metadata.courseId,
        userId: session.metadata.userId
      });

      res.status(200).json({
        status: 'success',
        data: {
          paid: false
        }
      });
    }
  } catch (error) {
    await stripeLogger.logTransaction('PAYMENT_VERIFICATION_ERROR', {
      sessionId,
      error: error.message
    });
    res.status(500).json({
      status: 'error',
      message: 'Errore nella verifica del pagamento'
    });
  }
};