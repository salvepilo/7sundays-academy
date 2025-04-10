import * as Course from '../models/Course.js';
import * as User from '../models/User.js';
import * as Lesson from '../models/Lesson.js';
import * as Test from '../models/Test.js';
import * as Enrollment from '../models/Enrollment.js';

export const getCourse = async (req, res) => {
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

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    // Calcolo del tasso di completamento
    const completedEnrollments = await Enrollment.countDocuments({ completed: true });
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    const roundedCompletionRate = Math.round(completionRate);

    // Calcolo del punteggio medio dei test
    const allTests = await Test.find();
    let totalScore = 0;
    for (const test of allTests) {
        totalScore += test.score;
        }
    const averageTestScore = allTests.length > 0 ? totalScore / allTests.length : 0;
    const roundedAverageTestScore = Math.round(averageTestScore);
        
    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
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

export const updateCourse = async (req, res) => {
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
