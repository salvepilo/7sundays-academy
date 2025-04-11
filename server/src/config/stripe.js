import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ottieni il percorso corrente del file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica le variabili d'ambiente
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Crea un'istanza di Stripe solo se la chiave è definita
let stripe;
if (process.env.STRIPE_KEY) {
  stripe = new Stripe(process.env.STRIPE_KEY);
} else {
  console.warn('Stripe non è configurato. Le funzionalità di pagamento non saranno disponibili.');
  // Crea un'istanza fittizia di Stripe che non farà nulla
  stripe = {
    products: {
      create: async () => ({ id: 'dummy-product-id' }),
      update: async () => ({ id: 'dummy-product-id' })
    },
    prices: {
      create: async () => ({ id: 'dummy-price-id' })
    },
    checkout: {
      sessions: {
        create: async () => ({ id: 'dummy-session-id' })
      }
    }
  };
}

// Funzione per creare un nuovo prodotto Stripe
export const createStripeProduct = async (course) => {
  try {
    if (!process.env.STRIPE_KEY) {
      console.warn('Stripe non è configurato. Restituisco ID fittizi.');
      return {
        productId: 'dummy-product-id',
        priceId: 'dummy-price-id'
      };
    }

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