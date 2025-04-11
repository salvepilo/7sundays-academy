import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createAdminUser = async () => {
  try {
    // Verifica se esiste già un admin
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Utente admin già esistente');
      return;
    }

    // Crea l'utente admin
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@7sundaysacademy.com',
      password: 'Admin123!',
      passwordConfirm: 'Admin123!',
      role: 'admin'
    });

    console.log('Utente admin creato con successo:', {
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role
    });
  } catch (error) {
    console.error('Errore nella creazione dell\'utente admin:', error);
  }
};

// Esegui la funzione
createAdminUser(); 