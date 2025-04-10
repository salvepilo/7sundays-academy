const Question = require('../models/Question');
const Answer = require('../models/Answer');

/**
 * Creates a new question for a lesson.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = await Question.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        question: newQuestion,
      },
    });
  } catch (err) {
    console.error('Errore nella creazione della domanda:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

/**
 * Gets all questions for a lesson.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ lesson: req.params.id });
    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: {
        questions,
      },
    });
  } catch (err) {
    console.error('Errore nel recupero delle domande:', err);
    res.status(500).json({
      status: 'error',
      message: 'Errore nel recupero delle domande',
    });
  }
};

/**
 * Creates a new answer for a question.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.createAnswer = async (req, res) => {
    try {
        req.body.question = req.params.questionId;
        const newAnswer = await Answer.create(req.body);
        res.status(201).json({
          status: 'success',
          data: {
            answer: newAnswer,
          },
        });
      } catch (err) {
        console.error('Errore nella creazione della risposta:', err);
        res.status(400).json({
          status: 'fail',
          message: err.message,
        });
      }
};

/**
 * Deletes a question.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.questionId);
    
        if (!question) {
          return res.status(404).json({
            status: 'fail',
            message: 'Domanda non trovata',
          });
        }
    
        await Answer.deleteMany({ question: req.params.questionId });
    
        res.status(204).json({
          status: 'success',
          data: null,
        });
      } catch (err) {
        console.error('Errore nell\'eliminazione della domanda:', err);
        res.status(500).json({
          status: 'error',
          message: 'Errore nell\'eliminazione della domanda',
        });
      }
};

/**
 * Deletes an answer.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findByIdAndDelete(req.params.answerId);

        if (!answer) {
            return res.status(404).json({
            status: 'fail',
            message: 'Risposta non trovata',
            });
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
        } catch (err) {
        console.error('Errore nell\'eliminazione della risposta:', err);
        res.status(500).json({
            status: 'error',
            message: 'Errore nell\'eliminazione della risposta',
        });
        }
};