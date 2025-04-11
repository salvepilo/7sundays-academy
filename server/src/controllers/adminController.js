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

    // System status (mock data for now)
    const systemStatus = {
      database: true,
      storage: true,
      email: true
    };

    res.json({
      totalUsers,
      activeCourses,
      monthlyEnrollments,
      totalRevenue,
      averageCompletionRate,
      systemStatus
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// @desc    Get recent activities
// @route   GET /api/admin/activities
// @access  Private/Admin
const getRecentActivities = asyncHandler(async (req, res) => {
  try {
    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('course', 'title');

    // Get recent course creations
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('instructor', 'name email');

    // Get recent payments
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Combine and format activities
    const activities = [
      ...recentEnrollments.map(enrollment => ({
        id: enrollment._id,
        type: 'enrollment',
        title: 'Nuova iscrizione al corso',
        description: `${enrollment.user.name} si è iscritto a ${enrollment.course.title}`,
        timestamp: enrollment.createdAt,
        user: {
          name: enrollment.user.name,
          email: enrollment.user.email
        }
      })),
      ...recentCourses.map(course => ({
        id: course._id,
        type: 'course_creation',
        title: 'Nuovo corso creato',
        description: `${course.title} è stato creato da ${course.instructor.name}`,
        timestamp: course.createdAt
      })),
      ...recentPayments.map(payment => ({
        id: payment._id,
        type: 'payment',
        title: 'Nuovo pagamento ricevuto',
        description: `Pagamento di €${payment.amount} ricevuto`,
        timestamp: payment.createdAt,
        user: {
          name: payment.user.name,
          email: payment.user.email
        }
      }))
    ];

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 10)); // Return only the 10 most recent activities
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Error fetching recent activities' });
  }
});

export {
  getDashboardStats,
  getRecentActivities
}; 