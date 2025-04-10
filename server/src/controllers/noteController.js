import Note from '../models/Note.js';

/**
 * Creates a new note for a specific lesson.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const createNote = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const newNote = await Note.create({
      lesson: lessonId,
      user: userId,
      content,
    });

    res.status(201).json({
      status: 'success',
      data: {
        note: newNote,
      },
    });
  } catch (err) {
    console.error('Error creating a new note:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error creating a new note',
    });
  }
};

/**
 * Retrieves all notes for a specific lesson.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const getNotes = async (req, res) => {
  try {
    const { id: lessonId } = req.params;
    const userId = req.user.id;

    const notes = await Note.find({ lesson: lessonId, user: userId });

    res.status(200).json({
      status: 'success',
      results: notes.length,
      data: {
        notes,
      },
    });
  } catch (err) {
    console.error('Error retrieving notes for a lesson:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving notes for a lesson',
    });
  }
};

/**
 * Deletes a note by its ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return res.status(404).json({
        status: 'fail',
        message: 'Note not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    console.error('Error deleting a note:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting a note',
    });
  }
};

export default {
  createNote,
  getNotes,
  deleteNote
};