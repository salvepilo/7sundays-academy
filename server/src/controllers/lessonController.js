import * as Lesson from '../models/Lesson.js';
import * as Course from '../models/Course.js';
import * as User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.status(200).json({
      status: 'success',
      data: {
        lessons,
      },
    });
  } catch (err) {
    console.error('Error getting lessons:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (err) {
    console.error('Error getting lesson by ID:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found',
      });
    }

    if (!course.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'fail',
        message: 'This course is not yet available',
      });
    }

    const lessons = await Lesson.find({ course: courseId }).sort('order');

    let lessonsWithProgress = lessons;
    if (req.user) {
      const user = await User.findById(req.user.id);
      const enrollment = user.enrolledCourses.find(
        (e) => e.courseId.toString() === courseId
      );

      if (enrollment && enrollment.lastWatched) {
        lessonsWithProgress = lessons.map((lesson) => {
          const lessonObj = lesson.toObject();
          lessonObj.isWatched =
            enrollment.progress === 100 ||
            (enrollment.lastWatched.lessonId &&
              enrollment.lastWatched.lessonId.toString() ===
                lesson._id.toString() &&
              enrollment.lastWatched.timestamp >= lesson.duration * 0.9);

          return lessonObj;
        });
      }
    }

    res.status(200).json({
      status: 'success',
      results: lessonsWithProgress.length,
      data: {
        lessons: lessonsWithProgress,
      },
    });
  } catch (err) {
    console.error('Error getting lessons:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error getting lessons',
    });
  }
};

export const getLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id).populate(
      'course',
      'title isPublished'
    );

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    if (
      (!lesson.isPublished || !lesson.course.isPublished) &&
      (!req.user || req.user.role !== 'admin')
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'This lesson is not yet available',
      });
    }

    if (req.user && req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const isEnrolled = user.enrolledCourses.some(
        (enrollment) =>
          enrollment.courseId.toString() === lesson.course._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          status: 'fail',
          message: 'You must enroll in the course to access this lesson',
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (err) {
    console.error('Error getting lesson:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error getting lesson',
    });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found',
      });
    }

    req.body.course = courseId;

    const lastLesson = await Lesson.findOne({ course: courseId }).sort('-order');
    req.body.order = lastLesson ? lastLesson.order + 1 : 1;

    const newLesson = await Lesson.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        lesson: newLesson,
      },
    });
  } catch (err) {
    console.error('Error creating lesson:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (err) {
    console.error('Error updating lesson:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    const courseId = lesson.course;
    const deletedOrder = lesson.order;

    await Lesson.deleteOne({ _id: req.params.id });

    await Lesson.updateMany(
      { course: courseId, order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Error deleting lesson:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting lesson',
    });
  }
};

export const updateWatchProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp, completed } = req.body;
    const userId = req.user.id;

    const lesson = await Lesson.findById(id).populate('course');
    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    const courseId = lesson.course._id;

    const user = await User.findById(userId);
    const enrollmentIndex = user.enrolledCourses.findIndex(
      (enrollment) => enrollment.courseId.toString() === courseId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are not enrolled in this course',
      });
    }

    user.enrolledCourses[enrollmentIndex].lastWatched = {
      lessonId: id,
      timestamp: timestamp || 0,
    };

    if (completed) {
      const lessons = await Lesson.find({ course: courseId });
      const totalLessons = lessons.length;
      const completedLessons = await getCompletedLessonsCount(user, lessons);
      const progress = Math.round((completedLessons / totalLessons) * 100);

      user.enrolledCourses[enrollmentIndex].progress = progress;

      if (progress === 100 && !user.completedCourses.includes(courseId)) {
        user.completedCourses.push(courseId);
        user.enrolledCourses[enrollmentIndex].completedAt = Date.now();
      }
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Watch progress updated successfully',
      data: {
        progress: user.enrolledCourses[enrollmentIndex].progress,
        lastWatched: user.enrolledCourses[enrollmentIndex].lastWatched,
      },
    });
  } catch (err) {
    console.error('Error updating watch progress:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating watch progress',
    });
  }
};

export const getLessonResources = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id).populate(
      'course',
      'title isPublished'
    );

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    if (
      (!lesson.isPublished || !lesson.course.isPublished) &&
      (!req.user || req.user.role !== 'admin')
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'This lesson is not yet available',
      });
    }

    if (req.user && req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const isEnrolled = user.enrolledCourses.some(
        (enrollment) =>
          enrollment.courseId.toString() === lesson.course._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          status: 'fail',
          message: 'You must enroll in the course to access these resources',
        });
      }
    }

    const resources = lesson.resources || [];

    res.status(200).json({
      status: 'success',
      data: {
        resources,
      },
    });
  } catch (err) {
    console.error('Error getting lesson resources:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error getting lesson resources',
    });
  }
};

export const getVideoToken = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id).populate(
      'course',
      'title isPublished'
    );

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    if (
      (!lesson.isPublished || !lesson.course.isPublished) &&
      (!req.user || req.user.role !== 'admin')
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'This lesson is not yet available',
      });
    }

    if (req.user && req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const isEnrolled = user.enrolledCourses.some(
        (enrollment) =>
          enrollment.courseId.toString() === lesson.course._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          status: 'fail',
          message: 'You must enroll in the course to access this video',
        });
      }
    }

    const token = generateSecureToken(req.user.id, lesson._id);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        videoUrl: lesson.videoUrl,
        protection: lesson.protection || 'standard',
      },
    });
  } catch (err) {
    console.error('Error generating video token:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error generating video token',
    });
  }
};

export const publishLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'The isPublished parameter must be a boolean value',
      });
    }

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      {
        isPublished,
        publishedAt:
          isPublished && !lesson?.publishedAt ? Date.now() : lesson?.publishedAt,
      },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (err) {
    console.error('Error publishing lesson:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error publishing lesson',
    });
  }
};

export const updateLessonOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOrder } = req.body;

    if (typeof newOrder !== 'number' || newOrder < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'The newOrder parameter must be a positive number',
      });
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    const courseId = lesson.course;
    const currentOrder = lesson.order;

    if (currentOrder === newOrder) {
      return res.status(200).json({
        status: 'success',
        message: 'The lesson order is already correct',
      });
    }

    if (newOrder > currentOrder) {
      await Lesson.updateMany(
        { course: courseId, order: { $gt: currentOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } else {
      await Lesson.updateMany(
        { course: courseId, order: { $gte: newOrder, $lt: currentOrder } },
        { $inc: { order: 1 } }
      );
    }

    lesson.order = newOrder;
    await lesson.save();

    res.status(200).json({
      status: 'success',
      message: 'Lesson order updated successfully',
      data: {
        lesson,
      },
    });
  } catch (err) {
    console.error('Error updating lesson order:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error updating lesson order',
    });
  }
};

const getCompletedLessonsCount = async (user, lessons) => {
  let completedCount = 0;

  if (!user.enrolledCourses.length || !lessons.length) {
    return completedCount;
  }

  const enrollment = user.enrolledCourses.find(
    (e) => e.courseId.toString() === lessons[0].course.toString()
  );

  if (!enrollment || !enrollment.lastWatched) {
    return completedCount;
  }

  for (const lesson of lessons) {
    if (
      (enrollment.lastWatched.lessonId &&
        enrollment.lastWatched.lessonId.toString() ===
          lesson._id.toString() &&
        enrollment.lastWatched.timestamp >= lesson.duration * 0.9) ||
      (lesson.order <
        lessons.find(
          (l) =>
            l._id.toString() === enrollment.lastWatched.lessonId?.toString()
        )?.order)
    ) {
      completedCount++;
    }
  }

  return completedCount;
};

const generateSecureToken = (userId, lessonId) => {
  return jwt.sign(
    { userId, lessonId, timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};