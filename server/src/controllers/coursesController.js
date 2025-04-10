const Course = require('../models/Course');

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