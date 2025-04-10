const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Il testo della domanda è obbligatorio'],
      trim: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'La domanda deve essere associata a una lezione'],
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    explanation: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['multipla', 'vero-falso', 'risposta-aperta'],
      default: 'multipla',
    },
    difficulty: {
      type: String,
      enum: ['facile', 'media', 'difficile'],
      default: 'media',
    },
    points: {
      type: Number,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indice per migliorare le performance delle query
questionSchema.index({ lesson: 1 });

// Virtual per le risposte degli studenti
questionSchema.virtual('answers', {
  ref: 'Answer',
  foreignField: 'question',
  localField: '_id'
});

// Middleware per le query per escludere le domande non attive
questionSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
