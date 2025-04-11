import stripe from '../config/stripe.js';
import Course from '../models/Course.js';

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
    const session = await stripe.checkout.sessions.create({
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

    res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id
      }
    });
  } catch (error) {
    console.error('Errore nella creazione della sessione di checkout:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella creazione della sessione di pagamento'
    });
  }
};

export const verifyPaymentSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      res.status(200).json({
        status: 'success',
        data: {
          paid: true,
          courseId: session.metadata.courseId
        }
      });
    } else {
      res.status(200).json({
        status: 'success',
        data: {
          paid: false
        }
      });
    }
  } catch (error) {
    console.error('Errore nella verifica del pagamento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella verifica del pagamento'
    });
  }
};