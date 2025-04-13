import nodemailer from 'nodemailer';
import EmailConfig from '../models/EmailConfig.js';

// Crea un transporter riutilizzabile
const createTransporter = async () => {
  try {
    // Ottieni la configurazione email attiva
    const config = await EmailConfig.findOne({ isActive: true });

    if (!config) {
      throw new Error('Nessuna configurazione email attiva trovata');
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  } catch (error) {
    console.error('Errore nella creazione del transporter email:', error);
    throw error;
  }
};

/**
 * Invia un'email
 * @param {Object} options - Opzioni per l'invio dell'email
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Oggetto
 * @param {string} options.text - Testo del messaggio
 * @param {string} [options.html] - HTML del messaggio (opzionale)
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = await createTransporter();

    // Ottieni la configurazione email attiva per il mittente
    const config = await EmailConfig.findOne({ isActive: true });

    if (!config) {
      throw new Error('Nessuna configurazione email attiva trovata');
    }

    const mailOptions = {
      from: config.defaultFrom,
      to,
      subject,
      text,
      html,
      replyTo: config.defaultReplyTo || config.defaultFrom,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email inviata:', info.messageId);
  } catch (error) {
    console.error('Errore nell\'invio dell\'email:', error);
    throw error;
  }
};

/**
 * Invia un'email di benvenuto
 * @param {Object} user - Utente a cui inviare l'email
 * @returns {Promise<void>}
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Benvenuto in 7Sundays Academy';
  const text = `Ciao ${user.name},\n\nBenvenuto in 7Sundays Academy! Siamo felici di averti con noi.\n\nInizia subito a esplorare i nostri corsi e a connetterti con altri professionisti.\n\nA presto,\nIl team di 7Sundays Academy`;

  await sendEmail({
    to: user.email,
    subject,
    text,
  });
};

/**
 * Invia un'email di reset password
 * @param {Object} user - Utente a cui inviare l'email
 * @param {string} resetToken - Token per il reset della password
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = 'Reset della password';
  const text = `Ciao ${user.name},\n\nHai richiesto il reset della password. Clicca sul link seguente per reimpostarla:\n\n${resetURL}\n\nSe non hai richiesto il reset della password, ignora questa email.\n\nIl link scadrà tra 10 minuti.`;

  await sendEmail({
    to: user.email,
    subject,
    text,
  });
};

/**
 * Invia un'email di notifica per una nuova richiesta di contatto
 * @param {Object} recipient - Destinatario della richiesta
 * @param {Object} sender - Mittente della richiesta
 * @param {string} message - Messaggio della richiesta
 * @returns {Promise<void>}
 */
export const sendContactRequestEmail = async (recipient, sender, message) => {
  const subject = 'Nuova richiesta di contatto';
  const text = `Ciao ${recipient.name},\n\nHai ricevuto una nuova richiesta di contatto da ${sender.name}.\n\nMessaggio:\n${message}\n\nAccedi alla piattaforma per gestire la richiesta.`;

  await sendEmail({
    to: recipient.email,
    subject,
    text,
  });
};

/**
 * Invia un'email di notifica per un nuovo messaggio
 * @param {Object} recipient - Destinatario del messaggio
 * @param {Object} sender - Mittente del messaggio
 * @param {string} message - Contenuto del messaggio
 * @returns {Promise<void>}
 */
export const sendNewMessageEmail = async (recipient, sender, message) => {
  const subject = 'Nuovo messaggio';
  const text = `Ciao ${recipient.name},\n\nHai ricevuto un nuovo messaggio da ${sender.name}.\n\nMessaggio:\n${message}\n\nAccedi alla piattaforma per rispondere.`;

  await sendEmail({
    to: recipient.email,
    subject,
    text,
  });
}; 