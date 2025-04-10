const Lesson = require('../models/Lesson');

exports.getAllLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find();
    res.status(200).json({
        status: 'success',
        data: {
            lessons
        }
    });
  } catch (err) {
    console.error('Error getting lessons:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};



exports.getLessonById = async (req, res) => {  try {
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


exports.createLesson = async (req, res) => {
  try {
    console.log('Data received for createLesson:', req.body);

    const newLesson = await Lesson.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            lesson: newLesson
        }
    });
  } catch (err) {
    console.error('Error creating lesson:', err);
    res.status(400).json({
        status: 'fail',
        message: err.message
    });
  }

};

exports.updateLesson = async (req, res) => {
  try {
    console.log('Data received for updateLesson:', req.body, 'Lesson ID:', req.params.id);

    const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if(!updatedLesson){
      return res.status(404).json({
        status: 'fail',
        message: 'Lesson not found',
      });
    }

    res.status(200).json({
        status: 'success',
        data: { lesson: updatedLesson }
    });
  } catch (err) {
    console.error('Error updating lesson:', err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
    try {
      const lessonId = req.params.id;
        await Lesson.findByIdAndDelete(lessonId);
        res.status(200).json({
            status: 'success',
            message: 'Lesson deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting lesson:', err);
        res.status(500).json({
            status: 'fail',
            message: err.message,
        });
    }
    };




// Ottieni tutte le lezioni di un corso
exports.getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verifica se il corso esiste
    const course = await Course.findById(courseId);
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

    // Ottieni le lezioni ordinate per 'order'
    const lessons = await Lesson.find({ course: courseId }).sort('order');

    // Se l'utente è iscritto, aggiungi informazioni sul progresso
    let lessonsWithProgress = lessons;
    if (req.user) {
      const user = await User.findById(req.user.id);
      const enrollment = user.enrolledCourses.find(
        e => e.courseId.toString() === courseId
      );

      if (enrollment && enrollment.lastWatched) {
        lessonsWithProgress = lessons.map(lesson => {
          const lessonObj = lesson.toObject();
          lessonObj.isWatched = enrollment.progress === 100 || 
            (enrollment.lastWatched.lessonId && 
             enrollment.lastWatched.lessonId.toString() === lesson._id.toString() && 
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
    console.error('Errore nel recupero delle lezioni:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle lezioni',
    });
  }
};

// Ottieni una singola lezione per ID
exports.getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findById(id).populate('course', 'title isPublished');

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata',
      });
    }

    // Verifica se la lezione è pubblicata o se l'utente è admin
    if ((!lesson.isPublished || !lesson.course.isPublished) && 
        (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'fail',
        message: 'Questa lezione non è ancora disponibile',
      });
    }

    // Verifica se l'utente è iscritto al corso
    if (req.user && req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const isEnrolled = user.enrolledCourses.some(
        enrollment => enrollment.courseId.toString() === lesson.course._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          status: 'fail',
          message: 'Devi iscriverti al corso per accedere a questa lezione',
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
    console.error('Errore nel recupero della lezione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero della lezione',
    });
  }
};

// Crea una nuova lezione (solo admin)
exports.createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verifica se il corso esiste
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'Corso non trovato',
      });
    }

    // Imposta il corso nella richiesta
    req.body.course = courseId;
    
    // Determina l'ordine della nuova lezione
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
    console.error('Errore nella creazione della lezione:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Aggiorna una lezione (solo admin)
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento della lezione:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Elimina una lezione (solo admin)
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata',
      });
    }

    // Memorizza il corso e l'ordine della lezione da eliminare
    const courseId = lesson.course;
    const deletedOrder = lesson.order;

    // Elimina la lezione (correzione: usando deleteOne invece di remove)
    await Lesson.deleteOne({ _id: req.params.id });

    // Aggiorna l'ordine delle lezioni successive
    await Lesson.updateMany(
      { course: courseId, order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Errore nell\'eliminazione della lezione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'eliminazione della lezione',
    });
  }
};

// Aggiorna il progresso di visualizzazione (NUOVA FUNZIONE)
exports.updateWatchProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp, completed } = req.body;
    const userId = req.user.id;

    // Verifica se la lezione esiste
    const lesson = await Lesson.findById(id).populate('course');
    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata',
      });
    }

    const courseId = lesson.course._id;

    // Verifica se l'utente è iscritto al corso
    const user = await User.findById(userId);
    const enrollmentIndex = user.enrolledCourses.findIndex(
      enrollment => enrollment.courseId.toString() === courseId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Non sei iscritto a questo corso',
      });
    }

    // Aggiorna l'ultima lezione vista
    user.enrolledCourses[enrollmentIndex].lastWatched = {
      lessonId: id,
      timestamp: timestamp || 0
    };

    // Se la lezione è completata, aggiorna il progresso del corso
    if (completed) {
      // Ottieni tutte le lezioni del corso
      const lessons = await Lesson.find({ course: courseId });
      const totalLessons = lessons.length;
      
      // Conta quante lezioni l'utente ha completato
      const completedLessons = await getCompletedLessonsCount(user, lessons);
      
      // Calcola la percentuale di completamento
      const progress = Math.round((completedLessons / totalLessons) * 100);
      
      // Aggiorna il progresso
      user.enrolledCourses[enrollmentIndex].progress = progress;
      
      // Se tutte le lezioni sono completate (100%), aggiungi il corso ai completati
      if (progress === 100 && !user.completedCourses.includes(courseId)) {
        user.completedCourses.push(courseId);
        user.enrolledCourses[enrollmentIndex].completedAt = Date.now();
      }
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Progresso di visualizzazione aggiornato con successo',
      data: {
        progress: user.enrolledCourses[enrollmentIndex].progress,
        lastWatched: user.enrolledCourses[enrollmentIndex].lastWatched
      }
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento del progresso di visualizzazione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'aggiornamento del progresso di visualizzazione'
    });
  }
};

// Ottieni le risorse della lezione (NUOVA FUNZIONE)
exports.getLessonResources = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findById(id).populate('course', 'title isPublished');

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata',
      });
    }

    // Verifica se la lezione è pubblicata o se l'utente è admin
    if ((!lesson.isPublished || !lesson.course.isPublished) && 
        (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'fail',
        message: 'Questa lezione non è ancora disponibile',
      });
    }

    // Verifica se l'utente è iscritto al corso
    if (req.user && req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const isEnrolled = user.enrolledCourses.some(
        enrollment => enrollment.courseId.toString() === lesson.course._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          status: 'fail',
          message: 'Devi iscriverti al corso per accedere a queste risorse',
        });
      }
    }

    // Estrai le risorse dalla lezione
    const resources = lesson.resources || [];

    res.status(200).json({
      status: 'success',
      data: {
        resources
      }
    });
  } catch (err) {
    console.error('Errore nel recupero delle risorse della lezione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle risorse della lezione'
    });
  }
};

// Ottieni token per accesso al video (NUOVA FUNZIONE)
exports.getVideoToken = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findById(id).populate('course', 'title isPublished');

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata',
      });
    }

    // Verifica se la lezione è pubblicata o se l'utente è admin
    if ((!lesson.isPublished || !lesson.course.isPublished) && 
        (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'fail',
        message: 'Questa lezione non è ancora disponibile',
      });
    }

    // Verifica se l'utente è iscritto al corso
    if (req.user && req.user.role !== 'admin') {
      const user = await User.findById(req.user.id);
      const isEnrolled = user.enrolledCourses.some(
        enrollment => enrollment.courseId.toString() === lesson.course._id.toString()
      );

      if (!isEnrolled) {
        return res.status(403).json({
          status: 'fail',
          message: 'Devi iscriverti al corso per accedere a questo video',
        });
      }
    }

    // Genera un token di accesso al video
    const token = generateSecureToken(req.user.id, lesson._id);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        videoUrl: lesson.videoUrl,
        protection: lesson.protection || 'standard'
      }
    });
  } catch (err) {
    console.error('Errore nella generazione del token video:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella generazione del token video'
    });
  }
};

// Pubblica o nascondi una lezione (solo admin) (NUOVA FUNZIONE)
exports.publishLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    // Verifica che il valore sia booleano
    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        status: 'fail',
        message: 'Il parametro isPublished deve essere un valore booleano'
      });
    }

    // Trova e aggiorna la lezione
    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { 
        isPublished,
        publishedAt: isPublished && !lesson?.publishedAt ? Date.now() : lesson?.publishedAt
      },
      { new: true, runValidators: true }
    );
    
    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        lesson
      }
    });
  } catch (err) {
    console.error('Errore nella pubblicazione della lezione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nella pubblicazione della lezione'
    });
  }
};

// Aggiorna l'ordine di una lezione (solo admin) (NUOVA FUNZIONE)
exports.updateLessonOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOrder } = req.body;
    
    // Verifica che newOrder sia un numero
    if (typeof newOrder !== 'number' || newOrder < 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Il parametro newOrder deve essere un numero positivo'
      });
    }

    // Trova la lezione da spostare
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'Lezione non trovata'
      });
    }

    const courseId = lesson.course;
    const currentOrder = lesson.order;
    
    // Se l'ordine non cambia, non fare nulla
    if (currentOrder === newOrder) {
      return res.status(200).json({
        status: 'success',
        message: 'L\'ordine della lezione è già quello richiesto'
      });
    }
    
    // Sposta le altre lezioni in base alla direzione del movimento
    if (newOrder > currentOrder) {
      // Spostamento in avanti: diminuisci l'ordine delle lezioni tra currentOrder e newOrder
      await Lesson.updateMany(
        { course: courseId, order: { $gt: currentOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } else {
      // Spostamento indietro: aumenta l'ordine delle lezioni tra newOrder e currentOrder
      await Lesson.updateMany(
        { course: courseId, order: { $gte: newOrder, $lt: currentOrder } },
        { $inc: { order: 1 } }
      );
    }
    
    // Aggiorna l'ordine della lezione corrente
    lesson.order = newOrder;
    await lesson.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Ordine della lezione aggiornato con successo',
      data: {
        lesson
      }
    });
  } catch (err) {
    console.error('Errore nell\'aggiornamento dell\'ordine della lezione:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nell\'aggiornamento dell\'ordine della lezione'
    });
  }
};

// Funzione helper per contare le lezioni completate da un utente
const getCompletedLessonsCount = async (user, lessons) => {
  let completedCount = 0;
  
  if (!user.enrolledCourses.length || !lessons.length) {
    return completedCount;
  }
  
  const enrollment = user.enrolledCourses.find(
    e => e.courseId.toString() === lessons[0].course.toString()
  );
  
  if (!enrollment || !enrollment.lastWatched) {
    return completedCount;
  }
  
  for (const lesson of lessons) {
    // Una lezione è considerata completata se:
    // 1. È l'ultima lezione vista e ha raggiunto almeno il 90% della durata
    // 2. O se sono state viste lezioni successive (che significa che questa è stata completata)
    if (
      (enrollment.lastWatched.lessonId && 
       enrollment.lastWatched.lessonId.toString() === lesson._id.toString() && 
       enrollment.lastWatched.timestamp >= lesson.duration * 0.9) ||
      (lesson.order < lessons.find(l => 
        l._id.toString() === enrollment.lastWatched.lessonId?.toString()
      )?.order)
    ) {
      completedCount++;
    }
  }
  
  return completedCount;
};

// Funzione di supporto per generare un token sicuro
const generateSecureToken = (userId, lessonId) => {
  // Crea un token che scade dopo 1 ora
  return jwt.sign(
    { userId, lessonId, timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};