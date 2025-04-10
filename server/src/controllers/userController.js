const User = require('../models/User')

const Course = require('../models/Course');
const TestAttempt = require('../models/TestAttempt');

// Ottieni tutti gli utenti (solo per admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results:users.length,
      data:{
        users
      },
    });
  } catch (error) {
    console.error('Errore nel recupero degli utenti:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero degli utenti',
    });
  }
};

// Ottieni un singolo utente per ID (solo per admin)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utente non trovato'
      })
  }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Errore nel recupero dell\'utente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dell\'utente',
    });
  }
};

// Aggiorna i dati dell'utente corrente
exports.updateMe = async (req, res) => {
  try {
    // Verifica che non si stia tentando di cambiare la password
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Questa route non è per l\'aggiornamento della password. Usa /updatePassword.'
      });
    }

    // Filtra i campi non consentiti
    const filteredBody = filterObj(req.body, 'name', 'email');

    // Aggiorna l'utente
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'utente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'aggiornamento dell\'utente',
    });
  }
};

// Disattiva l'account dell'utente corrente
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Errore nella disattivazione dell\'account:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella disattivazione dell\'account',
    });
  }
};

// Ottieni il profilo dell'utente corrente con statistiche
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Ottieni i corsi iscritti con dettagli
    const enrolledCourses = await Promise.all(
      user.enrolledCourses.map(async (enrollment) => {
        const course = await Course.findById(enrollment.courseId);
        return {
          ...course.toObject(), 
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          lastWatched: enrollment.lastWatched
        }
      })
    )

    // Ottieni i punteggi dei test
    const testScores = [];
    for (const [testId, score] of user.testScores.entries()) {
      const testAttempt = await TestAttempt.findOne({
        user: user._id,
        test: testId,
        percentageScore: score,
      }).populate('test', 'title')

      if (testAttempt && testAttempt.test) {
        testScores.push({
          testId,
          title: testAttempt.test.title,
          score,
          completedAt: testAttempt.completedAt
        })
      }
    }

    // Calcola statistiche
    const stats = {
      totalCourses: enrolledCourses.length,
      completedCourses: user.completedCourses.length,
      inProgressCourses: enrolledCourses.length - user.completedCourses.length,
      averageProgress: user.getAverageProgress(),
      testsTaken: testScores.length,
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        enrolledCourses,
        completedCourses: user.completedCourses,
        testScores, 
        stats
      },
    });
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero del profilo',
    });
  }
};

// Funzione di supporto per filtrare gli oggetti
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
module.exports = exports;