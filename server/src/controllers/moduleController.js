import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';

// Ottieni tutti i moduli di un corso
export const getModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Corso non trovato',
      });
    }

    const modules = await Module.find({ course: courseId })
      .populate('lessons')
      .sort('order');

    res.status(200).json({
      status: 'success',
      results: modules.length,
      data: {
        modules,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Ottieni un singolo modulo
export const getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate('lessons');

    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Modulo non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        module,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Crea un nuovo modulo
export const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Corso non trovato',
      });
    }

    // Imposta l'ordine del nuovo modulo
    const lastModule = await Module.findOne({ course: courseId }).sort('-order');
    const order = lastModule ? lastModule.order + 1 : 0;

    const newModule = await Module.create({
      ...req.body,
      course: courseId,
      order,
    });

    res.status(201).json({
      status: 'success',
      data: {
        module: newModule,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Aggiorna un modulo
export const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('lessons');

    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Modulo non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        module,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Elimina un modulo
export const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Modulo non trovato',
      });
    }

    // Aggiorna l'ordine dei moduli rimanenti
    await Module.updateMany(
      { course: module.course, order: { $gt: module.order } },
      { $inc: { order: -1 } }
    );

    await Module.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Aggiorna l'ordine dei moduli
export const updateModuleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOrder } = req.body;

    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Modulo non trovato',
      });
    }

    const courseId = module.course;
    const currentOrder = module.order;

    if (currentOrder === newOrder) {
      return res.status(400).json({
        status: 'error',
        message: "L'ordine del modulo è già corretto",
      });
    }

    // Aggiorna l'ordine degli altri moduli
    if (newOrder > currentOrder) {
      await Module.updateMany(
        { course: courseId, order: { $gt: currentOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } else {
      await Module.updateMany(
        { course: courseId, order: { $gte: newOrder, $lt: currentOrder } },
        { $inc: { order: 1 } }
      );
    }

    // Aggiorna l'ordine del modulo corrente
    module.order = newOrder;
    await module.save();

    res.status(200).json({
      status: 'success',
      message: 'Ordine del modulo aggiornato con successo',
      data: {
        module,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Aggiungi una lezione a un modulo
export const addLessonToModule = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.params;

    const module = await Module.findById(moduleId);
    const lesson = await Lesson.findById(lessonId);

    if (!module || !lesson) {
      return res.status(404).json({
        status: 'error',
        message: 'Modulo o lezione non trovati',
      });
    }

    if (module.lessons.includes(lessonId)) {
      return res.status(400).json({
        status: 'error',
        message: 'La lezione è già presente nel modulo',
      });
    }

    module.lessons.push(lessonId);
    await module.save();

    res.status(200).json({
      status: 'success',
      message: `Lezione ${lessonId} aggiunta al modulo ${moduleId}`,
      data: {
        module,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Rimuovi una lezione da un modulo
export const removeLessonFromModule = async (req, res) => {
  try {
    const { moduleId, lessonId } = req.params;

    const module = await Module.findByIdAndUpdate(
      moduleId,
      { $pull: { lessons: lessonId } },
      { new: true }
    );

    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Modulo non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Lezione ${lessonId} rimossa dal modulo ${moduleId}`,
      data: {
        module,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};