import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERRORE: STRIPE_SECRET_KEY non è definito nel file .env');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Funzione per creare un nuovo prodotto Stripe
export const createStripeProduct = async (course) => {
  try {
    // Crea il prodotto in Stripe
    const product = await stripe.products.create({
      name: course.title,
      description: course.description,
      images: course.thumbnail ? [course.thumbnail] : [],
      metadata: {
        courseId: course._id.toString(),
      },
    });

    // Crea il prezzo per il prodotto
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(course.price * 100), // Converti in centesimi
      currency: 'eur',
    });

    return {
      productId: product.id,
      priceId: price.id,
    };
  } catch (error) {
    console.error('Errore nella creazione del prodotto Stripe:', error);
    throw error;
  }
};

// Funzione per aggiornare un prodotto Stripe esistente
export const updateStripeProduct = async (course) => {
  try {
    if (!course.stripeProductId) {
      throw new Error('ID prodotto Stripe non trovato');
    }

    // Aggiorna il prodotto in Stripe
    await stripe.products.update(course.stripeProductId, {
      name: course.title,
      description: course.description,
      images: course.thumbnail ? [course.thumbnail] : [],
    });

    // Se il prezzo è cambiato, crea un nuovo prezzo
    if (course.isModified('price')) {
      const price = await stripe.prices.create({
        product: course.stripeProductId,
        unit_amount: Math.round(course.price * 100),
        currency: 'eur',
      });

      return { priceId: price.id };
    }

    return null;
  } catch (error) {
    console.error('Errore nell\'aggiornamento del prodotto Stripe:', error);
    throw error;
  }
};

// Funzione per archiviare un prodotto Stripe
export const archiveStripeProduct = async (productId) => {
  try {
    await stripe.products.update(productId, {
      active: false,
    });
  } catch (error) {
    console.error('Errore nell\'archiviazione del prodotto Stripe:', error);
    throw error;
  }
};

export default stripe;