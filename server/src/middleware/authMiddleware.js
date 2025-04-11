import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Verifica che JWT_SECRET sia disponibile prima di verificare il token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.error('No token found');
    return res.status(401).json({ message: 'Non sei autorizzato ad accedere a questa risorsa' });
  }

  try {
    // Verifica che JWT_SECRET sia disponibile
    if (!process.env.JWT_SECRET) {
      console.error('ERRORE: JWT_SECRET non è definito nel file .env');
      return res.status(500).json({ message: 'Errore di configurazione del server' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.error('User not found');
      return res.status(401).json({ message: 'L\'utente a cui appartiene il token non esiste' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Token non valido' });
  }
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.error('req.user is undefined');
      return res.status(401).json({ message: 'Non sei autenticato' });
    }

    if (req.originalUrl.includes('/stats/dashboard')) {
      if (!roles.includes(req.user.role)) {
        console.error('User is not an admin');
        return res.status(403).json({ message: 'Non hai i permessi per eseguire questa azione' });
      }
    } else if (!roles.includes(req.user.role)) {
      console.error('User role not allowed');
      return res.status(403).json({ message: 'Non hai i permessi per eseguire questa azione' });
    }
    next();
  };
};

export { protect, restrictTo };