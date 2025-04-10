import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Il titolo della lezione è obbligatorio'],
    trim: true,
    maxlength: [100, 'Il titolo non può superare i 100 caratteri'],
  },
  videoUrls: {
    type: [String], // Array di URL dei video
    required: [true, 'È richiesto almeno un URL per il video'],
  },
  notes: [
    {
      text: {
        type: String,
        required: [true, 'Il testo della nota è obbligatorio'],
      },
      videoTimestamp: {
        type: String,
        required: [true, 'Il timestamp del video è obbligatorio'],
      },
    },
  ],
});

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;