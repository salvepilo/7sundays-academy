const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// /api/courses/stats/dashboard
router.get('/stats/dashboard', authController.protect, authController.restrictTo('admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalTests: 0,
        totalEnrollments: 0,
        completionRate: 0,
        averageTestScore: 0,
      },
    },
  });
});

// /api/courses
router.get('/', authController.protect, authController.restrictTo('admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      courses: [],
    },
  });
});

module.exports = router;
```
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// /api/users
router.get('/', authController.protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            users: []
        }
    });
});

module.exports = router;
```
```javascript
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Inizializza l'app Express
const app = express();

// Configura Morgan per il logging delle richieste HTTP
app.use(morgan('dev'));

// CORS: Configura le origini consentite per le richieste
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
    // Aggiungi qui i domini di produzione quando necessario
];

app.use(cors({
    origin: function(origin, callback){
        // Permetti le richieste senza origine (es: curl)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Se devi gestire cookie o autenticazione con credenziali
}));

// Abilita il parsing del corpo delle richieste in formato JSON
app.use(express.json());
app.use(cookieParser());

// Importa i controller
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

// Importa le routes
const coursesRouter = require('./routes/courses');
const usersRouter = require('./routes/users');

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
  app.get('/api/users/me', authController.protect, userController.getMe || authController.getMe);
  app.get('/users/me', authController.protect, userController.getMe || authController.getMe);
}

// Route per courses
app.use('/api/courses', coursesRouter);

//Route per users
app.use('/api/users', usersRouter);

// Avvia il server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});