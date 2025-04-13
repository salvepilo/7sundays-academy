import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ottieni il percorso corrente del file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica le variabili d'ambiente dal file .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Verifica le variabili d'ambiente richieste
const requiredEnvVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERRORE: ${envVar} non è definito nel file .env`);
    process.exit(1);
  }
}

// Verifica che le chiavi di Stripe siano caricate correttamente
if (!process.env.STRIPE_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('ATTENZIONE: Le chiavi di Stripe non sono configurate. Le funzionalità di pagamento non saranno disponibili.');
  process.env.STRIPE_KEY = '';
  process.env.STRIPE_WEBHOOK_SECRET = '';
}

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import controllers

import * as authController from './controllers/authController.js';
import * as courseController from './controllers/courseController.js';
import * as testController from './controllers/testController.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import testRoutes from "./routes/testRoutes.js";
import lessonRoutes from './routes/lessonRoutes.js';
import networkingRoutes from './routes/networkingRoutes.js';
import emailConfigRoutes from './routes/emailConfigRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Importa lo script di inizializzazione admin
import './scripts/initAdmin.js';

// Express app
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

// =========================================================
// Middleware
// =========================================================

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Monitoring
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = { ...req.body };
    if (body.password) body.password = '********';
    console.log('Body:', JSON.stringify(body));
  }
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  }
});

// =========================================================
// Database Connection
// =========================================================

const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
};

const connectWithRetry = async (retryCount = 0, maxRetries = 5) => {
  try {
    console.log(`Connecting to MongoDB (attempt ${retryCount + 1}/${maxRetries})...`);
    await mongoose.connect(process.env.MONGODB_URI, MONGODB_OPTIONS);
    console.log('MongoDB connection established successfully');
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      console.log(`Retrying in ${delay/1000} seconds...`);
      setTimeout(() => connectWithRetry(retryCount + 1, maxRetries), delay);
    } else {
      console.error('Max retries reached. Unable to connect to database.');
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// =========================================================
// Routes
// =========================================================

// Configura il middleware raw per i webhook Stripe prima delle altre rotte
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Rotte API con rate limiting
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/courses', apiLimiter, courseRoutes);
app.use('/api/lessons', apiLimiter, lessonRoutes);
app.use('/api/tests', apiLimiter, testRoutes);
app.use('/api/networking', apiLimiter, networkingRoutes);
app.use('/api/email-config', apiLimiter, emailConfigRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// =========================================================
// Public Routes
// =========================================================

app.get('/', (req, res) => {
  res.json({
    message: '7Sundays Academy API is up and running',
    status: 'online',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    routes: {
      auth: {
        register: '/api/auth/register - POST',
        login: '/api/auth/login - POST',
        me: '/api/auth/me - GET (protected)'
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
// Error Handling
// =========================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: isDev ? err.message : 'Internal server error'
  });
});

// =========================================================
// Server Start
// =========================================================

// Avvia la connessione al database
connectWithRetry();

// Avvia il server
app.listen(PORT, () => {
  console.log('Server started');
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down...');
  app.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down...');
  app.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});