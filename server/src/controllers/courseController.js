const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// Ottieni tutti i corsi (con filtri opzionali)
exports.getAllCourses = async (req, res) => {
  try {
    // Costruisci la query di filtro
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Filtro avanzato (gt, gte, lt, lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    // Se l'utente non è admin, mostra solo i corsi pubblicati
    let query = Course.find(JSON.parse(queryStr));
    if (req.user && req.user.role !== 'admin') {
      query = query.find({ isPublished: true });
    }

    // Ordinamento
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    }else {
      query = query.sort('-createdAt');
    }

    // Limitazione dei campi
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Paginazione
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Esegui la query
    const courses = await query;

    let coursesWithProgress = courses;
    if (req.user) {
        // Aggiungi informazioni sul progresso per l'utente corrente
      const user = await User.findById(req.user.id);
      coursesWithProgress = courses.map(course => {
        const courseObj = course.toObject();
        const enrollment = user.enrolledCourses.find(
          e => e.courseId.toString() === course._id.toString()
        );
        
        return {
          ...courseObj,
          progress: enrollment ? enrollment.progress : 0,
          isEnrolled: !!enrollment,
          completed: user.completedCourses.includes(course._id),
        };
      });
    }

    res.status(200).json({
      status: 'success',
      results: coursesWithProgress.length,
      data: {
        courses: coursesWithProgress,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero dei corsi:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dei corsi',
    });
  }
};

module.exports = exports;

// Ottieni un singolo corso per ID
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('lessons');

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato',
      });
    }

    // Verifica se il corso è pubblicato o se l'utente è admin
    if (!course.isPublished && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'fail',
        message: 'Questo corso non è ancora disponibile',
      });
    }

        // Aggiungi informazioni sul progresso per l'utente corrente
    let courseWithProgress = course.toObject();
    if (req.user) {
      const user = await User.findById(req.user.id);

      const enrollment = user.enrolledCourses.find(
        e => e.courseId.toString() === course._id.toString()
      );
      
      courseWithProgress.progress = enrollment ? enrollment.progress : 0;
      courseWithProgress.isEnrolled = !!enrollment;
      courseWithProgress.completed = user.completedCourses.includes(course._id);
      
            if (enrollment && enrollment.lastWatched) {
        courseWithProgress.lastWatched = enrollment.lastWatched;
      }
    }
    courseWithProgress.name = courseWithProgress.title

    res.status(200).json({
      status: 'success',
      data: {
        course: courseWithProgress,
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

// Crea un nuovo corso (solo admin)
exports.createCourse = async (req, res) => {
  try {
    console.log("Received data for creating course:", req.body);
    
    const { name, ...otherData } = req.body;
    // Imposta l'istruttore come l'utente corrente (admin)
    req.body = { title: name, instructor: req.user.id, ...otherData }
    
    const newCourse = await Course.create(req.body);

    res.status(201).json({  
      status: 'success',
      data: {
        course: newCourse,
      },
    });
  } catch (err) {
    console.error('Errore nella creazione del corso:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Aggiorna un corso (solo admin)
exports.updateCourse = async (req, res) => {
  try {
    console.log('Received data for updating course:', req.body, 'course id:', req.params.id);
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
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Elimina un corso (solo admin)
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato'
      });
    }
    
        // Delete all lessons associated with the course
    await Lesson.deleteMany({ _id: { $in: course.lessons } });
    
    console.log("Course with ID " + courseId + " was deleted successfully.");
    console.log("Associated lessons were deleted successfully.");
    
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Errore nell\'eliminazione del corso:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'eliminazione del corso',
    });
  }
};

// Aggiungi una lezione a un corso (solo admin)
exports.addLessonToCourse = async (req, res) => {
  try {
    console.log("addLessonToCourse called");
    const { courseId, lessonId } = req.params;

    console.log('addLessonToCourse called with courseId:', courseId, 'and lessonId:', lessonId);

    const course = await Course.findById(courseId);
    const lesson = await Lesson.findById(lessonId);

    if (!course || !lesson) {
      return res.status(404).json({ message: 'Course or lesson not found' });
    }

    course.lessons.push(lessonId);
    await course.save();


    res.status(200).json({
      status: 'success',
      message: `Lesson ${lessonId} added to course ${courseId}`,
      data: course
    });
  } catch (err) {
    console.error('Errore nell\'aggiungere una lezione al corso:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'aggiungere una lezione al corso',
    });
  }
};

// Rimuovi una lezione da un corso (solo admin)
exports.removeLessonFromCourse = async (req, res) => {
  try{
    const { courseId, lessonId } = req.params;
    console.log('removeLessonFromCourse called with courseId:', courseId, 'and lessonId:', lessonId);
    
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $pull: { lessons: lessonId } },
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
        status: 'success',
        message: `Lesson ${lessonId} removed from course ${courseId}`,
        data: course
    });
  } catch (err) {
    console.error('Error in removing a lesson from a course:', err);
    res.status(500).json({ message: 'Error in removing a lesson from a course' });
  }
};

// Iscrivi l'utente corrente a un corso
exports.enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // Verifica se il corso esiste ed è pubblicato
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato',
      });
    }

    if (!course.isPublished) {
      return res.status(403).json({
        status: 'fail',
        message: 'Questo corso non è ancora disponibile',
      });
    }

    // Verifica se l'utente è già iscritto
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (isEnrolled) {
      return res.status(400).json({
        status: 'fail',
        message: 'Sei già iscritto a questo corso',
      });
    }

    // Iscrivi l'utente al corso
    user.enrolledCourses.push({
      courseId,
      progress: 0,
      enrolledAt: Date.now(),
    });

    await user.save({ validateBeforeSave: false });

    // Aggiorna le statistiche del corso
    await Course.calculateStats(courseId);

    res.status(200).json({
      status: 'success',
      message: 'Iscrizione al corso completata con successo',
    });
  } catch (err) {
    console.error('Errore nell\'iscrizione al corso:', err);
    res.status(500).json({
       status: 'error',
      message: 'Errore nell\'iscrizione al corso',
    });
  }
};

// Aggiorna il progresso dell'utente in un corso
exports.updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, progress, timestamp } = req.body;
    const userId = req.user.id;

    // Verifica se il corso e la lezione esistono
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato',
      });
    }

    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          status: 'fail',
          message: 'Lezione non trovata',
        });
      }
    }

    // Aggiorna il progresso dell'utente
    const user = await User.findById(userId);
    const enrollmentIndex = user.enrolledCourses.findIndex(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Non sei iscritto a questo corso',
      });
    }

    // Aggiorna il progresso
    if (progress !== undefined) {
      user.enrolledCourses[enrollmentIndex].progress = progress;
    }

    // Aggiorna l'ultima lezione vista
    if (lessonId) {
      user.enrolledCourses[enrollmentIndex].lastWatched = {
        lessonId,
        timestamp: timestamp || 0,
      };
    }

    // Se il progresso è 100%, aggiungi il corso ai completati
    if (progress === 100 && !user.completedCourses.includes(courseId)) {
      user.completedCourses.push(courseId);
    }

    await user.save({ validateBeforeSave: false });

    // Aggiorna le statistiche del corso
    await Course.calculateStats(courseId);

    res.status(200).json({
      status: 'success',
      message: 'Progresso aggiornato con successo',
      data: {
        progress: user.enrolledCourses[enrollmentIndex].progress,
        lastWatched: user.enrolledCourses[enrollmentIndex].lastWatched,
      },
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento del progresso:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'aggiornamento del progresso',
    });
  }
};

// Ottieni statistiche dei corsi per la dashboard admin
/**
 * @route   GET /api/courses/stats/dashboard
 * @desc    Get course statistics for the admin dashboard
 * @access  Private (admin only)
 * @param   {object} req - The request object
 * @param   {object} res - The response object
 * @returns {object} - Returns the course statistics
 */

exports.getCourseStats = async (req, res) => {
  try {
    // Statistiche generali dei corsi
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    
    // Statistiche di iscrizione
    const users = await User.find();
    const totalEnrollments = users.reduce((acc, user) => acc + user.enrolledCourses.length, 0);
    const completedCourses = users.reduce((acc, user) => acc + user.completedCourses.length, 0);
    
    // Corsi più popolari
        const courses = await Course.find().sort('-enrollmentCount').limit(5);
        const topCourses = courses.map(course => ({
            id: course._id,
      title: course.title,
      enrollments: course.enrollmentCount || 0,
      completionRate: course.completionRate || 0
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completedCourses,
        completionRate: totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0,
        topCourses
      }
    });
  } catch (err) {
    console.error('Errore nel recupero delle statistiche dei corsi:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle statistiche dei corsi'
    });
  }
};

// Ottieni i corsi a cui l'utente è iscritto
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Trova l'utente e popola i corsi iscritti
    const user = await User.findById(userId).populate({
      path: 'enrolledCourses.courseId',
      select: 'title description thumbnail duration category level isPublished'
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utente non trovato'
      });
    }
    
    // Formatta i dati per la risposta
    const enrolledCourses = user.enrolledCourses
      .filter(enrollment => enrollment.courseId) // Filtra eventuali riferimenti nulli
      .map(enrollment => {
        const course = enrollment.courseId.toObject();
        return {
          ...course,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          lastWatched: enrollment.lastWatched,
          completed: user.completedCourses.includes(course._id)
        };
      });
    
    res.status(200).json({
      status: 'success',
      results: enrolledCourses.length,
      data: {
        courses: enrolledCourses
      }
    });
  } catch (err) {
    console.error('Errore nel recupero dei corsi iscritti:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero dei corsi iscritti'
    });
  }
};

// Genera un certificato per un corso completato
exports.generateCertificate = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    
    // Verifica se l'utente ha completato il corso
    const user = await User.findById(userId);
    
    if (!user.completedCourses.includes(courseId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Non puoi generare un certificato per un corso non completato'
      });
    }
    
    // Ottieni i dettagli del corso
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato'
      });
    }
    
    // Trova l'enrollment per ottenere la data di completamento
    const enrollment = user.enrolledCourses.find(
      e => e.courseId.toString() === courseId
    );
    
    // Prepara i dati del certificato
    const certificateData = {
      courseId,
      courseTitle: course.title,
      userName: `${user.firstName} ${user.lastName}`,
      issueDate: new Date(),
      completionDate: enrollment ? enrollment.completedAt || new Date() : new Date(),
      certificateId: `CERT-${userId.slice(-5)}-${courseId.slice(-5)}-${Date.now().toString().slice(-5)}`
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        certificate: certificateData
      }
    });
  } catch (err) {
    console.error('Errore nella generazione del certificato:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella generazione del certificato'
    });
  }
};

// Pubblica o nascondi un corso (solo admin)
exports.publishCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { isPublished } = req.body;
    
    // Verifica che il valore sia booleano
    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'Il parametro isPublished deve essere un valore booleano'
      });
    }
    
    // Trova e aggiorna il corso
    const course = await Course.findByIdAndUpdate(
      courseId,
      { isPublished },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato'
      });
    }
    
    // Aggiorna la data di pubblicazione se necessario
    if (isPublished && !course.publishedAt) {
      course.publishedAt = Date.now();
      await course.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (err) {
    console.error('Errore nella pubblicazione del corso:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella pubblicazione del corso'
    });
  }
};