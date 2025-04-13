import mongoose from 'mongoose';
import EmailConfig from '../models/EmailConfig.js';
import dotenv from 'dotenv';

dotenv.config();

const initEmailConfig = async () => {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI);

    // Verifica se esiste già una configurazione email
    const existingConfig = await EmailConfig.findOne({ isActive: true });

    if (!existingConfig) {
      // Crea una nuova configurazione email
      const defaultConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        defaultFrom: process.env.SMTP_FROM || 'noreply@7sundaysacademy.com',
        defaultReplyTo: process.env.SMTP_REPLY_TO || 'info@7sundaysacademy.com',
        isActive: true,
        createdBy: process.env.ADMIN_USER_ID, // Assicurati di avere un admin user ID
      };

      await EmailConfig.create(defaultConfig);
      console.log('Configurazione email di default creata con successo');
    } else {
      console.log('Esiste già una configurazione email attiva');
    }

    // Chiudi la connessione
    await mongoose.disconnect();
  } catch (error) {
    console.error('Errore nell\'inizializzazione della configurazione email:', error);
    process.exit(1);
  }
};

initEmailConfig(); 