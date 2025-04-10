// Caricamento variabili d'ambiente
require("dotenv").config();

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
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS: Configura le origini consentite per le richieste
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
  // Aggiungi qui i domini di produzione quando necessario
];

app.use(cors({
  origin: (origin, callback) => { 
    if (!origin) return callback(null, true); 

    if (allowedOrigins.includes(origin)) { 
      callback(null, true); 
    } else { 
      console.warn(`Richiesta CORS bloccata da origine: ${origin}`); 
      callback(null, true); 
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
// Importa i controller
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const coursesController = require('./controllers/coursesController');
const testController = require('./controllers/testController');

//Importa le routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const testRoutes = require("./routes/testRoutes");
const lessonRoutes = require('./routes/lessonRoutes');
const networkingRoutes = require('./routes/networkingRoutes');
const emailConfigRoutes = require('./routes/emailConfigRoutes');

// ------ DEFINIZIONE DIRETTA DELLE ROUTE DI AUTENTICAZIONE ------
// Route di autenticazione
app.post('/api/auth/register', authController.signup); // Cambiato da register a signup
app.post('/api/auth/login', authController.login);

// Versione senza /api per retrocompatibilità
app.post('/auth/register', authController.signup); // Cambiato da register a signup
app.post('/auth/login', authController.login);

// Applica il middleware di autenticazione a tutte le routes protette
app.use('/api/auth/me', authController.protect);
app.use('/auth/me', authController.protect);
app.get('/api/auth/me', authController.getMe);
app.get('/auth/me', authController.getMe);

try {
  // Applica rate limiter alle route API
  app.use('/api/', apiLimiter);

  // Applica il middleware di protezione solo alle route che lo richiedono
  app.use('/api/users', authController.protect);
  app.use('/api/courses', authController.protect);
  app.use('/api/lessons', authController.protect);
  app.use('/api/tests', authController.protect);
  app.use('/api/networking', authController.protect);
  app.use('/api/email-config', authController.protect);
  
  app.use('/users', authController.protect);
  app.use('/courses', authController.protect);
  app.use('/lessons', authController.protect);
  app.use('/tests', authController.protect);
  app.use('/networking', authController.protect);
  app.use('/email-config', authController.protect);

  // Mount delle route con prefisso /api
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/lessons', lessonRoutes);
  app.use('/api/tests', testRoutes);
  app.use('/api/networking', networkingRoutes);
  app.use('/api/email-config', emailConfigRoutes);

  // Versione senza /api per retrocompatibilità
  app.use('/auth', authRoutes);
  app.use('/courses', courseRoutes);
  app.use('/users', userRoutes);
  app.use('/lessons', lessonRoutes);
  app.use('/tests', testRoutes);
  app.use('/networking', networkingRoutes);
  app.use('/email-config', emailConfigRoutes);

} catch(error){
  console.error('Errore durante la configurazione delle routes:', error);
}

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