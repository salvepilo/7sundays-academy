/**
 * Server principale 7Sundays Academy
 * Configurazione Express, connessione MongoDB e gestione delle route API
 */

// Caricamento variabili d'ambiente
require('dotenv').config();

// Importazione dipendenze
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Inizializzazione dell'app Express
const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

// =========================================================
// CONFIGURAZIONE MIDDLEWARE
// =========================================================

// Sicurezza: Helmet per proteggere con header HTTP
app.use(helmet({
  contentSecurityPolicy: false, // Disabilitato per sviluppo
  crossOriginEmbedderPolicy: false // Disabilitato per sviluppo
}));

// CORS: Configura le origini consentite per le richieste
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
  // Aggiungi qui i domini di produzione quando necessario
];

app.use(cors({
  origin: (origin, callback) => {
    // Consenti richieste senza origine (come app mobile o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Richiesta CORS bloccata da origine: ${origin}`);
      callback(null, true); // Permesso anche se non nell'elenco (solo per sviluppo)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight per 24 ore
}));

// Parser per il corpo delle richieste
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging delle richieste
if (isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Monitoring middleware - Registra tutte le richieste
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    // Oscura le password nei log
    const body = { ...req.body };
    if (body.password) body.password = '********';
    console.log('Body:', JSON.stringify(body));
  }
  next();
});

// Rate limiting configurazione
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: isDev ? 1000 : 100, // Più permissivo in sviluppo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Troppe richieste, riprova più tardi.'
  }
});

// =========================================================
// CONNESSIONE AL DATABASE
// =========================================================

// Connessione MongoDB con gestione errori e retry
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/7sundaysacademy';
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout per la selezione del server
};

const connectWithRetry = async (retryCount = 0, maxRetries = 5) => {
  try {
    console.log(`Tentativo di connessione a MongoDB (${retryCount + 1}/${maxRetries})...`);
    await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
    console.log('✅ Connessione al database MongoDB stabilita con successo');
  } catch (err) {
    console.error(`❌ Errore di connessione al database: ${err.message}`);
    
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Backoff esponenziale
      console.log(`Nuovo tentativo in ${delay/1000} secondi...`);
      setTimeout(() => connectWithRetry(retryCount + 1, maxRetries), delay);
    } else {
      console.error('❌ Numero massimo di tentativi raggiunto. Impossibile connettersi al database.');
      process.exit(1); // Termina l'applicazione in caso di errore fatale
    }
  }
};

// Gestione degli eventi di connessione a MongoDB
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnesso. Tentativo di riconnessione...');
  setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Errore nella connessione MongoDB:', err);
});

// Avvia la connessione
connectWithRetry();

// =========================================================
// CONFIGURAZIONE ROUTE
// =========================================================

// Importa i controller direttamente per garantire che le route funzionino
const authController = require('./controllers/authController');

let coursesRoutes = null, usersRoutes = null;

let userController = null, courseController = null, lessonController = null, testController = null, networkingController = null, emailConfigController = null;
let authRoutes = null, userRoutes = null, courseRoutes = null, lessonRoutes = null, testRoutes = null, networkingRoutes = null, emailConfigRoutes = null;

try {
  userController = require('./controllers/userController');
} catch (error) {
  console.warn('⚠️ userController non disponibile:', error.message);
}

try {
  courseController = require('./controllers/courseController');
} catch (error) {
  console.warn('⚠️ courseController non disponibile:', error.message);
}

try {
  lessonController = require('./controllers/lessonController');
} catch (error) {
  console.warn('⚠️ lessonController non disponibile:', error.message);
}

try {
  testController = require('./controllers/testController');
} catch (error) {
  console.warn('⚠️ testController non disponibile:', error.message);
}

try {
  networkingController = require('./controllers/networkingController');
} catch (error) {
  console.warn('⚠️ networkingController non disponibile:', error.message);
}

try {
  emailConfigController = require('./controllers/emailConfigController');
} catch (error) {
  console.warn('⚠️ emailConfigController non disponibile:', error.message);
}

try {
    coursesRoutes = require('./routes/courses');
  } catch (error) {
    console.warn('⚠️ coursesRoutes non disponibile');
  }
  
try {
    usersRoutes = require('./routes/users');
  } catch (error) {
    console.warn('⚠️ usersRoutes non disponibile');
  }
  
  try {
    emailConfigRoutes = require('./routes/emailConfigRoutes');
  } catch (error) {
    console.warn('⚠️ emailConfigRoutes non disponibile:', error.message);
  }
try {  authRoutes = require('./routes/authRoutes');
} catch (error) {

  console.warn('⚠️ authRoutes non disponibile, verranno usate route dirette');
}

try {
  userRoutes = require('./routes/userRoutes');
} catch (error) {
  console.warn('⚠️ userRoutes non disponibile');
}

try {
  courseRoutes = require('./routes/courseRoutes');
} catch (error) {
  console.warn('⚠️ courseRoutes non disponibile');
}

try {
  lessonRoutes = require('./routes/lessonRoutes');
} catch (error) {
  console.warn('⚠️ lessonRoutes non disponibile');
}

try {
  testRoutes = require('./routes/testRoutes');
} catch (error) {
  console.warn('⚠️ testRoutes non disponibile');
}

try {
  networkingRoutes = require('./routes/networkingRoutes');
} catch (error) {
  console.warn('⚠️ networkingRoutes non disponibile');
}

// ------ DEFINIZIONE DIRETTA DELLE ROUTE DI AUTENTICAZIONE ------
// Queste sono le route essenziali che funzioneranno anche se le route dai file non possono essere caricate

// Route di autenticazione
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authController.protect, authController.getMe);

// Versione senza /api per retrocompatibilità
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.get('/auth/me', authController.protect, authController.getMe);

// Route utente (se disponibili)
if (userController) {
  app.get('/api/users/me', authController.protect, userController.getMe);
  app.get('/users/me', authController.protect, userController.getMe);
}

// ------ CARICAMENTO ROUTE DA FILE SE DISPONIBILI ------

// Applica rate limiter alle route API
app.use('/api/', apiLimiter);

// Mount delle route con prefisso /api
if (authRoutes) app.use('/api/auth', authRoutes);
if (courseRoutes) app.use('/api/courses', courseRoutes);
if (lessonRoutes) app.use('/api/lessons', lessonRoutes);
if (testRoutes) app.use('/api/tests', testRoutes);
if (networkingRoutes) app.use('/api/networking', networkingRoutes);
if (emailConfigRoutes) app.use('/api/email-config', emailConfigRoutes);

// Versione senza /api per retrocompatibilità
if (authRoutes) app.use('/auth', authRoutes);
if (courseRoutes) app.use('/courses', courseRoutes);
if (lessonRoutes) app.use('/lessons', lessonRoutes);
if (testRoutes) app.use('/tests', testRoutes);
if (networkingRoutes) app.use('/networking', networkingRoutes);
if (emailConfigRoutes) app.use('/email-config', emailConfigRoutes);

// =========================================================
// ROUTE PUBBLICHE
// =========================================================

// Route di base per verificare che il server sia attivo
app.get('/', (req, res) => {
  res.json({
    message: 'API 7Sundays Academy attiva e funzionante',
    status: 'online',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    routes: {
      auth: {
        register: '/api/auth/register - POST',
        login: '/api/auth/login - POST',
        me: '/api/auth/me - GET (protetta)'
      },
      users: '/api/users - GET (admin)',
      emailConfig: {
        getAll: '/api/email-config - GET (admin)',
        getActive: '/api/email-config/active - GET (admin)',
        create: '/api/email-config - POST (admin)',
        update: '/api/email-config/:id - PATCH (admin)',
        delete: '/api/email-config/:id - DELETE (admin)',
        activate: '/api/email-config/:id/activate - PATCH (admin)',
        test: '/api/email-config/test - POST (admin)'
      }
    }
  });
});

// Route per il controllo dello stato di salute
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// =========================================================
// GESTIONE ERRORI
// =========================================================

// Gestione errori 404
app.use((req, res, next) => {
  console.log(`⚠️ 404: ${req.method} ${req.originalUrl} non trovata`);
  res.status(404).json({ 
    status: 'fail',
    message: 'Risorsa non trovata',
    path: req.originalUrl
  });
});

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  console.error('❌ Errore:', err);
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const errorMessage = err.message || 'Errore interno del server';
  
  // Prepara la risposta con maggiori dettagli in sviluppo
  const errorResponse = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message: errorMessage
  };
  
  // Aggiungi dettagli aggiuntivi in modalità sviluppo
  if (isDev) {
    errorResponse.stack = err.stack;
    if (err.name === 'ValidationError') {
      errorResponse.details = err.errors;
    }
  }
  
  res.status(statusCode).json(errorResponse);
});

// Gestione degli errori di sintassi JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'fail',
      message: 'JSON non valido nella richiesta'
    });
  }
  next(err);
});

// =========================================================
// AVVIO SERVER
// =========================================================

// Avvio dell'applicazione
const server = app.listen(PORT, () => {
  console.log(`✅ Server in esecuzione sulla porta ${PORT}`);
  console.log(`- Ambiente: ${NODE_ENV}`);
  console.log(`- URL: http://localhost:${PORT}`);
});

// Gestione corretta della chiusura del server
process.on('SIGTERM', () => {
  console.log('Segnale SIGTERM ricevuto. Chiusura in corso...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Connessione MongoDB chiusa.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('Segnale SIGINT ricevuto. Chiusura in corso...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Connessione MongoDB chiusa.');
      process.exit(0);
    });
  });
});

module.exports = app; // Per i test