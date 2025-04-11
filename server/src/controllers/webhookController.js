import stripe from '../config/stripe.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Gestione degli eventi webhook di Stripe
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verifica la firma del webhook
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET non configurato');
    }

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Gestione degli eventi di pagamento
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent completato:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.error('Pagamento fallito:', failedPayment.id);
        // Implementa la logica per gestire i pagamenti falliti
        break;

      default:
        console.log(`Evento non gestito: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Errore webhook:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// Gestione del pagamento completato con successo
async function handleSuccessfulPayment(session) {
  try {
    // Recupera i metadati della sessione
    const { courseId, userId } = session.metadata;

    // Verifica che il corso e l'utente esistano
    const [course, user] = await Promise.all([
      Course.findById(courseId),
      User.findById(userId)
    ]);

    if (!course || !user) {
      throw new Error('Corso o utente non trovato');
    }

    // Aggiorna l'iscrizione dell'utente
    if (!user.enrolledCourses.some(enrollment => 
      enrollment.courseId.toString() === courseId
    )) {
      user.enrolledCourses.push({
        courseId: courseId,
        enrolledAt: new Date(),
        progress: 0,
        lastWatched: null
      });

      // Incrementa il contatore degli iscritti al corso
      course.enrolledCount += 1;

      await Promise.all([
        user.save(),
        course.save()
      ]);

      console.log(`Utente ${userId} iscritto con successo al corso ${courseId}`);
    }
  } catch (error) {
    console.error('Errore nella gestione del pagamento:', error);
    throw error;
  }
};