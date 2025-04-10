const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Il titolo della lezione è obbligatorio'],
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
      required: [true, 'La lezione deve appartenere a un corso'],
    },
    videoUrl: {
      type: String,
      required: [true, 'URL del video è obbligatorio'],
    },
    duration: {
      type: Number, // Durata in secondi
      required: [true, 'La durata della lezione è obbligatoria'],
    },
    order: {
      type: Number,
      required: [true, "L'ordine della lezione è obbligatorio"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: String,
        type: {
          type: String,
          enum: ['pdf', 'link', 'file'],
        },
        url: String,
      },
    ],
    transcript: {
      type: String,
      default: '',
    },
    // Impostazioni di protezione del video
    protection: {
      watermark: {
        enabled: {
          type: Boolean,
          default: true,
        },
        text: {
          type: String,
          default: '7Sundays Academy',
        },
      },
      downloadDisabled: {
        type: Boolean,
        default: true,
      },
      screenRecordingProtection: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indice composto per garantire che l'ordine sia unico all'interno di un corso
lessonSchema.index({ course: 1, order: 1 }, { unique: true });

// Virtual per formattare la durata in formato leggibile (HH:MM:SS)
lessonSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
});

// Middleware per aggiornare la durata totale del corso quando viene aggiunta/modificata una lezione
lessonSchema.post('save', async function() {
  try {
    const Course = mongoose.model('Course');
    const Lesson = this.constructor;
    
    // Calcola la durata totale del corso
    const lessons = await Lesson.find({ course: this.course });
    const totalDuration = lessons.reduce((total, lesson) => total + lesson.duration, 0);
    
    // Formatta la durata totale
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const formattedDuration = `${hours}h ${minutes}m`;
    
    // Aggiorna il corso
    await Course.findByIdAndUpdate(this.course, { duration: formattedDuration });
  } catch (err) {
    console.error('Errore nell\'aggiornamento della durata del corso:', err);
  }
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;