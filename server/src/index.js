import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ottieni il percorso corrente del file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica le variabili d'ambiente dal file .env
dotenv.config({ path: '/home/user/7sundays-academy/server/.env' });

// Verifica che JWT_SECRET sia caricato correttamente
if (!process.env.JWT_SECRET) {
  console.error('ERRORE: JWT_SECRET non è definito nel file .env');
  process.exit(1);
}

// Verifica che le chiavi di Stripe siano caricate correttamente
// Verifica che le chiavi di Stripe siano caricate correttamente
if (!process.env.STRIPE_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn('ATTENZIONE: Le chiavi di Stripe non sono configurate. Alcune funzionalità potrebbero non essere disponibili.');
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

// Express app
const app = express();
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

// =========================================================
// Middleware
// =========================================================

// Security
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

//CORS middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked from origin: ${origin}`);
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// Middleware
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

const MONGODB_URI = 'mongodb+srv://andreafarneti98:Rkthub100!*@cluster0.gicdmgw.mongodb.net/7sundaysacademy?retryWrites=true&w=majority';
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
};

const connectWithRetry = async (retryCount = 0, maxRetries = 5) => {
  try {
    console.log(`Connecting to MongoDB (attempt ${retryCount + 1}/${maxRetries})...`);
   await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
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

connectWithRetry();

// =========================================================
// Routes
// =========================================================
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/networking', networkingRoutes);
app.use('/api', emailConfigRoutes);
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

// 404 error handler
app.use((req, res, next) => {
  console.log(`404: ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({
    status: 'fail',
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const errorMessage = err.message || 'Internal server error';

  const errorResponse = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message: errorMessage
  };

  if (isDev) {
    errorResponse.stack = err.stack;
    if (err.name === 'ValidationError') {
      errorResponse.details = err.errors;
    }
  }

  res.status(statusCode).json(errorResponse);
});

// JSON syntax error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid JSON in request'
    });
  }
  next(err);
});

// =========================================================
// Server Startup
// =========================================================

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Server started');
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});


process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});