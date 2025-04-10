const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/emailService');

// Funzione per generare il token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = exports;
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
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

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
      passwordConfirm,
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

// Aggiornamento della password (quando l'utente è già autenticato)
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Ottieni l'utente dalla collezione
    const user = await User.findById(req.user.id).select('+password');
    
    // 2) Verifica se la password corrente è corretta
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'La password corrente non è corretta',
      });
    }
    
    // 3) Aggiorna la password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    
    // 4) Effettua il login con la nuova password
    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Errore durante l\'aggiornamento della password:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore durante l\'aggiornamento della password. Riprova più tardi.',
    });
  }
};

// Richiesta di reset password
exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Trova l'utente con l'email fornita
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Nessun utente trovato con questa email.',
      });
    }

    // 2) Genera il token di reset password
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Invia l'email con il token
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetToken, resetUrl);
      res.status(200).json({
        status: 'success',
        message: 'Email di reset password inviata!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Errore durante l\'invio dell\'email:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Errore durante l\'invio dell\'email. Riprova più tardi.',
      });
    }
  } catch (err) {
    console.error('Errore durante la richiesta di reset password:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore durante la richiesta di reset password. Riprova più tardi.',
    });
  }
};

// Reset della password
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Ottieni l'utente in base al token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ 
      passwordResetToken: hashedToken, 
      passwordResetExpires: { $gt: Date.now() } 
    });

    // 2) Se il token è scaduto o non valido
    if (!user) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Token non valido o scaduto.' 
      });
    }

    // 3) Aggiorna la password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Genera e invia il token JWT
    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Errore durante il reset della password:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore durante il reset della password. Riprova più tardi.',
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

    // 4) Verifica se l'utente ha cambiato la password dopo l'emissione del token
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'La password è stata modificata di recente. Effettua nuovamente il login.',
      });
    }

    // 5) Imposta l'utente nella richiesta
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
    console.error('JWT Verification Error:', err);
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
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utente non trovato',
      });
    }
    
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      status: 'success',
      data: {
        user
      },
    });
  } catch (err) {
    console.error('Errore nel recupero del profilo:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero del profilo. Riprova più tardi.',
    });
  }
};