import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';
import Payment from '../models/paymentModel.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get active courses
    const activeCourses = await Course.countDocuments({ status: 'active' });
    
    // Get monthly enrollments
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Get total revenue
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get average completion rate
    const enrollments = await Enrollment.find().populate('course');
    const completionRates = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.completedLessons.length;
      return (completedLessons / totalLessons) * 100;
    });
    
    const averageCompletionRate = completionRates.length > 0
      ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
      : 0;

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('course', 'title');

    // Get popular courses
    const popularCourses = await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $project: {
          name: 1,
          enrollments: { $size: '$enrollments' },
          revenue: { $multiply: ['$price', { $size: '$enrollments' }] }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      activeCourses,
      monthlyEnrollments,
      totalRevenue,
      averageCompletionRate,
      recentEnrollments: recentEnrollments.map(enrollment => ({
        userId: enrollment.user._id,
        courseId: enrollment.course._id,
        date: enrollment.createdAt,
        userName: enrollment.user.name,
        courseName: enrollment.course.title
      })),
      popularCourses
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// @desc    Get monthly statistics
// @route   GET /api/admin/stats/monthly
// @access  Private/Admin
const getMonthlyStats = asyncHandler(async (req, res) => {
  try {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    const stats = [];

    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const startDate = new Date();
      startDate.setMonth(monthIndex);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMonth(monthIndex + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      const [users, enrollments, completions, testAttempts] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Enrollment.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Enrollment.countDocuments({ 
          createdAt: { $gte: startDate, $lte: endDate },
          completedLessons: { $exists: true, $ne: [] }
        }),
        Enrollment.countDocuments({ 
          createdAt: { $gte: startDate, $lte: endDate },
          testAttempts: { $exists: true, $ne: [] }
        })
      ]);

      stats.unshift({
        month: months[monthIndex],
        users,
        enrollments,
        completions,
        testAttempts
      });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ message: 'Error fetching monthly statistics' });
  }
});

// @desc    Get course completion statistics
// @route   GET /api/admin/stats/completion
// @access  Private/Admin
const getCourseCompletionStats = asyncHandler(async (req, res) => {
  try {
    const courses = await Course.find().populate('enrollments');
    
    const completionStats = courses.map(course => {
      const enrollments = course.enrollments.length;
      const completions = course.enrollments.filter(e => e.completedLessons.length === course.lessons.length).length;
      const completionRate = enrollments > 0 ? (completions / enrollments) * 100 : 0;

      return {
        courseName: course.title,
        enrollments,
        completions,
        completionRate: Math.round(completionRate * 10) / 10
      };
    });

    res.json(completionStats);
  } catch (error) {
    console.error('Error fetching course completion stats:', error);
    res.status(500).json({ message: 'Error fetching course completion statistics' });
  }
});

export {
  getDashboardStats,
  getMonthlyStats,
  getCourseCompletionStats
}; 