const Course = require('../models/Course');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Test = require('../models/Test');
const Enrollment = require('../models/Enrollment');

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        course,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero del corso:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero del corso',
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ active: true }); 
    const totalCourses = await Course.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    // Calcolo del tasso di completamento (semplificato)
    const completedEnrollments = await Enrollment.countDocuments({ completed: true });
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    // Calcolo del punteggio medio dei test (semplificato)
    const testScores = await Test.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" }
        }
      }
    ]);
    const averageTestScore = testScores.length > 0 ? testScores[0].averageScore : 0;

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalCourses,
          totalLessons,
          totalTests,
          totalEnrollments,
          completionRate: completionRate.toFixed(2),
          averageTestScore: averageTestScore.toFixed(2),
        },
      },
    });
  } catch (err) {
    console.error('Errore nel recupero delle statistiche della dashboard:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle statistiche della dashboard',
    });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        course,
      },
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento del corso:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'aggiornamento del corso',
    });
  }
};