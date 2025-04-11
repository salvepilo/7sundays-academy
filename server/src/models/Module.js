import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Il titolo del modulo è obbligatorio'],
      trim: true,
      maxlength: [100, 'Il titolo non può superare i 100 caratteri'],
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Il corso è obbligatorio'],
    },
    order: {
      type: Number,
      default: 0,
    },
    lessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    }],
    duration: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    objectives: [{
      title: {
        type: String,
        required: true,
      },
      description: String,
    }],
    requirements: [{
      title: {
        type: String,
        required: true,
      },
      description: String,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual per calcolare il numero di lezioni
moduleSchema.virtual('lessonsCount').get(function() {
  return this.lessons ? this.lessons.length : 0;
});

// Virtual per calcolare la durata totale del modulo
moduleSchema.virtual('totalDuration').get(function() {
  return this.duration || 0;
});

// Middleware per aggiornare la durata del modulo quando vengono aggiunte/rimosse lezioni
moduleSchema.pre('save', async function(next) {
  if (this.isModified('lessons')) {
    const Lesson = mongoose.model('Lesson');
    const lessons = await Lesson.find({ _id: { $in: this.lessons } });
    this.duration = lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }
  next();
});

const Module = mongoose.model('Module', moduleSchema);

export default Module;