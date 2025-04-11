import { createStripeProduct, updateStripeProduct, archiveStripeProduct } from '../config/stripe.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Section from '../models/sectionModel.js';
import Enrollment from '../models/enrollmentModel.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import stripe from '../config/stripe.js';

const getAllCourses = asyncHandler(async (req, res) => {
  try {
    const {
      category,
      level,
      status,
      instructor,
      search,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (level) query.level = level;
    if (status) query.status = status;
    if (instructor) query.instructor = instructor;
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { totalEnrollments: -1 },
      rating: { rating: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 }
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const courses = await Course.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('instructor', 'name email profileImage');

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

const getCourse = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profileImage bio')
      .populate({
        path: 'sections',
        populate: {
          path: 'lessons',
          select: 'title description duration isFree order status'
        }
      });

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Error fetching course' });
  }
});

const createCourse = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      category,
      subcategories,
      level,
      requirements,
      objectives,
      targetAudience,
      language,
      certificate,
      tags
    } = req.body;

    // Upload thumbnail if provided
    let thumbnailUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'course-thumbnails');
      thumbnailUrl = result.secure_url;
    }

    const course = await Course.create({
      title,
      description,
      shortDescription,
      price,
      category,
      subcategories,
      level,
      thumbnail: thumbnailUrl,
      requirements,
      objectives,
      targetAudience,
      language,
      certificate,
      tags,
      instructor: req.user._id
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
});

const updateCourse = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Upload new thumbnail if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'course-thumbnails');
      course.thumbnail = result.secure_url;
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'thumbnail') {
        course[key] = req.body[key];
      }
    });

    const updatedCourse = await course.save();

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course' });
  }
});

const deleteCourse = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Delete associated sections and lessons
    await Section.deleteMany({ course: course._id });
    await Lesson.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });

    await course.remove();

    res.json({ message: 'Course removed' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});

const getCourseStats = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const enrollments = await Enrollment.find({ course: course._id });
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length;

    const averageProgress = enrollments.reduce((acc, curr) => acc + curr.progress, 0) / totalEnrollments || 0;
    const averageRating = course.rating;
    const totalRevenue = enrollments.reduce((acc, curr) => acc + (curr.payment?.amount || 0), 0);

    res.json({
      totalEnrollments,
      completedEnrollments,
      activeEnrollments,
      averageProgress,
      averageRating,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({ message: 'Error fetching course statistics' });
  }
});

const toggleCourseStatus = asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course.status = course.status === 'published' ? 'draft' : 'published';
    await course.save();

    res.json({ status: course.status });
  } catch (error) {
    console.error('Error toggling course status:', error);
    res.status(500).json({ message: 'Error toggling course status' });
  }
});

const addLessonToCourse = asyncHandler(async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const {
      title,
      description,
      videoUrl,
      duration,
      isFree,
      order,
      resources,
      status
    } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Verify section exists and belongs to course
    const section = await Section.findOne({ _id: sectionId, course: courseId });
    if (!section) {
      res.status(404);
      throw new Error('Section not found or does not belong to this course');
    }

    // Create lesson
    const lesson = await Lesson.create({
      title,
      description,
      videoUrl,
      duration,
      isFree,
      order,
      resources,
      status,
      course: courseId,
      section: sectionId
    });

    // Add lesson to section
    section.lessons.push(lesson._id);
    await section.save();

    // Update course's total lessons count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { totalLessons: 1 }
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Error adding lesson:', error);
    res.status(500).json({ message: 'Error adding lesson to course' });
  }
});

const enrollInCourse = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const { paymentMethodId } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id
    });

    if (existingEnrollment) {
      res.status(400);
      throw new Error('You are already enrolled in this course');
    }

    // Handle payment if course is not free
    let payment = null;
    if (course.price > 0) {
      if (!paymentMethodId) {
        res.status(400);
        throw new Error('Payment method is required for paid courses');
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(course.price * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/courses/${courseId}`
      });

      payment = {
        amount: course.price,
        currency: 'usd',
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id
      };
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      course: courseId,
      student: req.user._id,
      payment,
      status: 'active',
      progress: 0
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { totalEnrollments: 1 }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Error enrolling in course' });
  }
});

const generateCertificate = asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Check if user is enrolled and has completed the course
    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user._id,
      status: 'completed'
    });

    if (!enrollment) {
      res.status(403);
      throw new Error('You must complete the course to receive a certificate');
    }

    // Generate certificate data
    const certificateData = {
      studentName: req.user.name,
      courseTitle: course.title,
      completionDate: enrollment.completedAt,
      certificateId: `7SA-${courseId.slice(-6)}-${req.user._id.slice(-6)}`,
      issueDate: new Date(),
      instructorName: course.instructor.name
    };

    // TODO: Generate actual certificate PDF using a PDF generation library
    // For now, we'll return the certificate data
    res.json({
      ...certificateData,
      downloadUrl: `${process.env.API_URL}/certificates/${certificateData.certificateId}.pdf`
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
});

const getEnrolledCourses = asyncHandler(async (req, res) => {
  try {
    const { status, sort, page = 1, limit = 10 } = req.query;

    const query = { student: req.user._id };
    if (status) query.status = status;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      progressAsc: { progress: 1 },
      progressDesc: { progress: -1 }
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;

    const enrollments = await Enrollment.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'course',
        select: 'title description thumbnail instructor price totalLessons',
        populate: {
          path: 'instructor',
          select: 'name profileImage'
        }
      });

    const total = await Enrollment.countDocuments(query);

    // Transform the data to include enrollment-specific information
    const courses = enrollments.map(enrollment => ({
      ...enrollment.course.toObject(),
      enrollment: {
        status: enrollment.status,
        progress: enrollment.progress,
        completedAt: enrollment.completedAt,
        enrolledAt: enrollment.createdAt
      }
    }));

    res.json({
      courses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Error fetching enrolled courses' });
  }
});

export {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  toggleCourseStatus,
  addLessonToCourse,
  enrollInCourse,
  generateCertificate,
  getEnrolledCourses
};