import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connessione al database
    await mongoose.connect(process.env.MONGODB_URI);

    // Verifica se esiste già un utente admin
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (!existingAdmin) {
      // Crea un nuovo utente admin
      const adminUser = {
        name: 'Admin',
        email: 'admin@7sundaysacademy.com',
        password: 'Admin123!',
        passwordConfirm: 'Admin123!',
        role: 'admin',
        isActive: true,
      };

      const user = await User.create(adminUser);
      console.log('Utente admin creato con successo:', user._id);

      // Aggiorna il file .env con l'ID dell'admin
      const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/7sundaysacademy

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@7sundaysacademy.com
SMTP_REPLY_TO=info@7sundaysacademy.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin User ID
ADMIN_USER_ID=${user._id}`;

      // Scrivi il contenuto nel file .env
      const fs = await import('fs');
      await fs.promises.writeFile('.env', envContent);
      console.log('File .env aggiornato con l\'ID dell\'admin');
    } else {
      console.log('Esiste già un utente admin:', existingAdmin._id);
    }

    // Chiudi la connessione
    await mongoose.disconnect();
  } catch (error) {
    console.error('Errore nella creazione dell\'utente admin:', error);
    process.exit(1);
  }
};

createAdminUser(); 