const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

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

module.exports = { protect, restrictTo };