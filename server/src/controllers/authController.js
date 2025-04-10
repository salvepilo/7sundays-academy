const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Funzione per generare il token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Funzione per creare e inviare il token nella risposta
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Rimuovi la password dalla risposta
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

// Registrazione di un nuovo utente
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se l'utente esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email già registrata',
      });
    }

    // Crea un nuovo utente
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'user', // Default role
    });

    // Genera e invia il token JWT
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('Errore durante la registrazione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore durante la registrazione. Riprova più tardi.',
    });
  }
};

// Login utente
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verifica se email e password sono stati forniti
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Fornisci email e password',
      });
    }

    // Trova l'utente e seleziona esplicitamente il campo password
    const user = await User.findOne({ email }).select('+password');

    // Verifica se l'utente esiste e la password è corretta
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email o password non corretti',
      });
    }

    // Genera e invia il token JWT
    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Errore durante il login:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore durante il login. Riprova più tardi.',
    });
  }
};

// Middleware per proteggere le route che richiedono autenticazione
exports.protect = async (req, res, next) => {
  try {
    // 1) Ottieni il token e verifica se esiste
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Non sei autenticato. Effettua il login per accedere.',
      });
    }

    // 2) Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verifica se l'utente esiste ancora
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: "L'utente a cui appartiene questo token non esiste più.",
      });
    }

    // 4) Imposta l'utente nella richiesta
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token non valido. Effettua nuovamente il login.',
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Il tuo token è scaduto. Effettua nuovamente il login.',
      });
    }
    console.error('Errore di autenticazione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore durante l\'autenticazione. Riprova più tardi.',
    });
  }
};

// Middleware per limitare l'accesso in base al ruolo
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Non hai i permessi per eseguire questa azione',
      });
    }
    next();
  };
};

// Ottieni i dati dell'utente corrente
exports.getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
};