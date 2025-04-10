import User from '../models/User.js';
import Course from '../models/Course.js';
import TestAttempt from '../models/TestAttempt.js';

const userController = {};

// Funzione di supporto per filtrare gli oggetti
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all users (only for admin)a
userController.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
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

// Create a new user (only for admin)
userController.createUser = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || 'user'
    });

    // Rimuovi la password dalla risposta
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.error('Errore nella creazione dell\'utente:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get a single user by ID (only for admin)
userController.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utente non trovato'
      });
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

// Update an existing user (only for admin)
userController.updateUser = async (req, res) => {
  try {
    // Non permettere l'aggiornamento della password con questa route
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Questa route non è per l\'aggiornamento della password.'
      });
    }

    // Filtra i campi non consentiti
    const filteredBody = filterObj(req.body, 'name', 'email', 'role', 'active');

    // Aggiorna l'utente
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utente non trovato'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'utente:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update the current user's data
userController.updateMe = async (req, res) => {
  try {
    // Verifica che non si stia tentando di cambiare la password
    if (req.body.password || req.body.passwordConfirm) {
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
    });

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

// Deactivate the current user's account
userController.deleteMe = async (req, res) => {
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

// Get the current user's profile with statistics
userController.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utente non trovato'
      });
    }

    // Get enrolled courses with details
    const enrolledCourses = await Promise.all(
      user.enrolledCourses.map(async (enrollment) => {
        const course = await Course.findById(enrollment.courseId);
        if (!course) return null;
        
        return {
          ...course.toObject(),
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          lastWatched: enrollment.lastWatched
        };
      })
    ).then(courses => courses.filter(Boolean)); // Filtra eventuali corsi null

    // Get test scores
    const testScores = [];
    for (const [testId, score] of user.testScores.entries()) {
      const testAttempt = await TestAttempt.findOne({
        user: user._id,
        test: testId,
        percentageScore: score,
      }).populate('test', 'title');

      if (testAttempt && testAttempt.test) {
        testScores.push({
          testId,
          title: testAttempt.test.title,
          score,
          completedAt: testAttempt.completedAt
        });
      }
    }

    // Calculate statistics
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


export default userController;
