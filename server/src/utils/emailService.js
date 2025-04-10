/**
 * Servizio per l'invio di email
 * Utilizza nodemailer e le configurazioni dal database
 */
const nodemailer = require('nodemailer');
const EmailConfig = require('../models/EmailConfig');

// Cache per il transporter
let cachedTransporter = null;
let lastConfigUpdate = null;

/**
 * Crea un transporter nodemailer basato sulla configurazione attiva
 * @returns {Promise<nodemailer.Transporter>} Il transporter configurato
 */
async function createTransporter() {
  try {
    // Ottieni la configurazione email attiva dal database
    const config = await EmailConfig.findOne({ isActive: true }).select('+auth.pass');
    
    if (!config) {
      throw new Error('Nessuna configurazione email attiva trovata');
    }
    
    // Memorizza l'ultimo aggiornamento della configurazione
    lastConfigUpdate = config.updatedAt;
    
    // Crea il transporter con le impostazioni dal database
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass
      },
      // Opzioni aggiuntive
      tls: {
        rejectUnauthorized: false // Utile in ambiente di sviluppo
      }
    });
  } catch (error) {
    console.error('Errore nella creazione del transporter email:', error);
    throw error;
  }
}

/**
 * Ottiene un transporter valido, creandone uno nuovo se necessario
 * @returns {Promise<nodemailer.Transporter>} Il transporter configurato
 */
async function getTransporter() {
  try {
    // Se esiste già un transporter in cache, verifica se è ancora valido
    if (cachedTransporter) {
      // Controlla se la configurazione è stata aggiornata
      const currentConfig = await EmailConfig.findOne({ isActive: true });
      
      if (currentConfig && currentConfig.updatedAt <= lastConfigUpdate) {
        return cachedTransporter;
      }
    }
    
    // Crea un nuovo transporter e aggiorna la cache
    cachedTransporter = await createTransporter();
    return cachedTransporter;
  } catch (error) {
    console.error('Errore nel recupero del transporter email:', error);
    throw error;
  }
}

/**
 * Invia un'email utilizzando la configurazione attiva
 * @param {Object} options - Opzioni per l'email
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Oggetto dell'email
 * @param {string} options.text - Testo dell'email (plaintext)
 * @param {string} options.html - Contenuto HTML dell'email
 * @param {string} [options.from] - Mittente (opzionale, usa il default se non specificato)
 * @param {string} [options.replyTo] - Indirizzo per le risposte (opzionale)
 * @returns {Promise<Object>} Risultato dell'invio
 */
async function sendEmail(options) {
  try {
    // Ottieni la configurazione email attiva
    const config = await EmailConfig.findOne({ isActive: true });
    
    if (!config) {
      throw new Error('Nessuna configurazione email attiva trovata');
    }
    
    // Ottieni il transporter
    const transporter = await getTransporter();
    
    // Prepara le opzioni dell'email
    const mailOptions = {
      from: options.from || config.defaultFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
      replyTo: options.replyTo || config.defaultReplyTo || config.defaultFrom
    };
    
    // Invia l'email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email inviata con successo:', result.messageId);
    return result;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email:', error);
    throw error;
  }
}

/**
 * Invia un'email di benvenuto a un nuovo utente
 * @param {Object} user - L'utente a cui inviare l'email
 * @returns {Promise<Object>} Risultato dell'invio
 */
async function sendWelcomeEmail(user) {
  const subject = 'Benvenuto su 7Sundays Academy!';
  const text = `Ciao ${user.name}, Benvenuto su 7Sundays Academy! Siamo felici di averti con noi. Inizia subito ad imparare qualcosa di nuovo! Puoi accedere alla piattaforma con la tua email: ${user.email} Buon apprendimento! Il team di 7Sundays Academy`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Benvenuto su 7Sundays Academy!</h2>
      <p>Ciao <strong>${user.name}</strong>,</p>
      <p>Siamo felici di darti il benvenuto nella nostra piattaforma di apprendimento online.</p>
      <p>Puoi accedere alla piattaforma con la tua email: <strong>${user.email}</strong></p>
      <p>Inizia subito a esplorare i nostri corsi e a migliorare le tue competenze!</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;">Hai domande? Contattaci all'indirizzo <a href="mailto:support@7sundays.com">support@7sundays.com</a></p>
      </div>
      <p style="margin-top: 30px;">Buon apprendimento!<br>Il team di 7Sundays Academy</p>
    </div>
  `;
  
  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}

/**
 * Invia un'email di reset password
 * @param {Object} user - L'utente a cui inviare l'email
 * @param {string} resetToken - Il token di reset
 * @param {string} resetUrl - L'URL per il reset della password
 * @returns {Promise<Object>} Risultato dell'invio
 */
async function sendPasswordResetEmail(user, resetToken, resetUrl) {
  const subject = 'Reset della password - 7Sundays Academy';
  const text = `Ciao ${user.name}, Hai richiesto il reset della password. Clicca sul seguente link per reimpostare la tua password: ${resetUrl} Questo link scadrà tra 10 minuti. Se non hai richiesto il reset della password, ignora questa email. Il team di 7Sundays Academy`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Reset della Password</h2>
      <p>Ciao <strong>${user.name}</strong>,</p>
      <p>Hai richiesto il reset della password. Clicca sul pulsante qui sotto per reimpostare la tua password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reimposta Password</a>
      </div>
      <p>Oppure copia e incolla questo URL nel tuo browser:</p>
      <p style="word-break: break-all; color: #4b5563;">${resetUrl}</p>
      <p><strong>Questo link scadrà tra 10 minuti.</strong></p>
      <p>Se non hai richiesto il reset della password, ignora questa email.</p>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;">Hai domande? Contattaci all'indirizzo <a href="mailto:support@7sundays.com">support@7sundays.com</a></p>
      </div>
      <p style="margin-top: 30px;">Cordiali saluti,<br>Il team di 7Sundays Academy</p>
    </div>
  `;
  
  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}

/**
 * Invia una notifica di completamento corso
 * @param {Object} user - L'utente a cui inviare l'email
 * @param {Object} course - Il corso completato
 * @returns {Promise<Object>} Risultato dell'invio
 */
async function sendCourseCompletionEmail(user, course) {
  const subject = `Congratulazioni! Hai completato il corso "${course.title}"`;
  const text = `Ciao ${user.name}, Complimenti! Hai completato con successo il corso ${course.title}. Cosa aspetti? Continua a migliorare le tue competenze con i nostri altri corsi. Il team di 7Sundays Academy`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Congratulazioni!</h2>
      <p>Ciao <strong>${user.name}</strong>,</p>
      <p>Hai completato con successo il corso:</p>
      <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #1e40af;">${course.title}</h3>
        <p style="margin-bottom: 0;">${course.description}</p>
      </div>
      <p>Continua a migliorare le tue competenze con i nostri altri corsi.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://7sundays.com/dashboard/courses" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Esplora Altri Corsi</a>
      </div>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;">Hai domande? Contattaci all'indirizzo <a href="mailto:support@7sundays.com">support@7sundays.com</a></p>
      </div>
      <p style="margin-top: 30px;">Cordiali saluti,<br>Il team di 7Sundays Academy</p>
    </div>
  `;
  
  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}

/**
 * Invia una notifica di risultato test
 * @param {Object} user - L'utente a cui inviare l'email
 * @param {Object} test - Il test completato
 * @param {number} score - Il punteggio ottenuto
 * @param {boolean} passed - Se l'utente ha superato il test
 * @returns {Promise<Object>} Risultato dell'invio
 */
async function sendTestResultEmail(user, test, score, passed) {
  const subject = `Risultati del test "${test.title}" - 7Sundays Academy`;
  const text = `Ciao ${user.name}, Hai completato il test ${test.title} con un punteggio di ${score}%. ${passed ? 'Congratulazioni! Hai superato il test.' : 'Purtroppo non hai superato il test. Riprova dopo aver ripassato il materiale.'} Il team di 7Sundays Academy`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Risultati del Test</h2>
      <p>Ciao <strong>${user.name}</strong>,</p>
      <p>Hai completato il test:</p>
      <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #1e40af;">${test.title}</h3>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Il tuo punteggio</div>
        <div style="width: 120px; height: 120px; border-radius: 50%; background-color: ${passed ? '#10b981' : '#ef4444'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; margin: 0 auto;">
          ${score}%
        </div>
        <p style="margin-top: 20px; font-size: 18px; color: ${passed ? '#10b981' : '#ef4444'}; font-weight: bold;">
          ${passed ? 'Congratulazioni! Hai superato il test.' : 'Purtroppo non hai superato il test.'}
        </p>
      </div>
      ${!passed ? `
      <p>Non preoccuparti! Ecco cosa puoi fare:</p>
      <ul>
        <li>Ripassa il materiale del corso</li>
        <li>Rivedi gli appunti</li>
        <li>Prova a rifare il test quando ti senti pronto</li>
      </ul>
      ` : ''}
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://7sundays.com/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Torna alla Dashboard</a>
      </div>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;">Hai domande? Contattaci all'indirizzo <a href="mailto:support@7sundays.com">support@7sundays.com</a></p>
      </div>
      <p style="margin-top: 30px;">Cordiali saluti,<br>Il team di 7Sundays Academy</p>
    </div>
  `;
  
  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendCourseCompletionEmail,
  sendTestResultEmail
};