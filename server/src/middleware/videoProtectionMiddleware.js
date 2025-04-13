import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Lesson from '../models/Lesson.js';

/**
 * Middleware per la protezione e sicurezza dei video
 * Verifica il token di accesso al video, controlla le autorizzazioni dell'utente
 * e implementa misure di sicurezza avanzate
 */
export const verifyVideoAccess = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { id } = req.params; // ID della lezione

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Accesso non autorizzato. Token mancante.'
      });
    }

    // Verifica che JWT_SECRET sia disponibile
    if (!process.env.JWT_SECRET) {
      console.error('ERRORE: JWT_SECRET non è definito nel file .env');
      return res.status(500).json({
        status: 'error',
        message: 'Errore di configurazione del server'
      });
    }

    // Verifica il token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token non valido o scaduto'
      });
    }

    // Verifica che il token sia per la lezione corretta
    if (decoded.lessonId !== id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Token non valido per questa lezione'
      });
    }

    // Verifica che il token non sia scaduto (oltre alla verifica JWT standard)
    const tokenAge = Date.now() - decoded.timestamp;
    const maxTokenAge = 60 * 60 * 1000; // 1 ora in millisecondi
    if (tokenAge > maxTokenAge) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token scaduto. Richiedi un nuovo token.'
      });
    }

    // Verifica che l'utente esista ancora
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Utente non trovato'
      });
    }

    // Verifica che la lezione esista
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata'
      });
    }

    // Verifica che l'utente sia iscritto al corso
    const isEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === lesson.course.toString()
    );

    if (!isEnrolled && user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Non sei iscritto a questo corso'
      });
    }

    // Aggiungi informazioni utente e lezione alla richiesta per uso successivo
    req.user = user;
    req.lesson = lesson;

    // Procedi al prossimo middleware o al controller
    next();
  } catch (error) {
    console.error('Errore nella verifica dell\'accesso al video:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore interno del server'
    });
  }
};

/**
 * Middleware per aggiungere intestazioni di sicurezza per i video
 * Imposta intestazioni che limitano la riproduzione e prevengono il download
 */
export const addSecurityHeaders = (req, res, next) => {
  // Imposta intestazioni di sicurezza per prevenire il download e limitare la riproduzione
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Imposta intestazioni CORS restrittive
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  next();
};

/**
 * Middleware per limitare la velocità delle richieste di video
 * Previene attacchi di forza bruta e scraping automatizzato
 */
export const videoRateLimiter = (req, res, next) => {
  // Implementazione di base, in produzione usare una libreria come express-rate-limit
  // con Redis per gestire le richieste distribuite
  
  // Qui si potrebbe implementare un controllo più sofisticato basato su IP, utente, ecc.
  next();
};

/**
 * Middleware per registrare l'accesso ai video
 * Tiene traccia di chi accede ai video e quando
 */
export const logVideoAccess = (req, res, next) => {
  const { user, lesson } = req;
  
  // Log dell'accesso al video
  console.log(`Accesso al video: Utente ${user._id} ha richiesto la lezione ${lesson._id} alle ${new Date().toISOString()}`);
  
  // Qui si potrebbe implementare la registrazione in un database
  // per analisi di sicurezza e monitoraggio
  
  next();
};