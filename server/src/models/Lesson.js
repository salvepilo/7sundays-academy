import mongoose from 'mongoose';

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
      required: [true, 'La descrizione della lezione è obbligatoria'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Il corso è obbligatorio'],
    },
    videoUrl: {
      type: String,
      required: [true, 'È richiesto un URL per il video'],
    },
    duration: {
      type: Number,
      required: [true, 'La durata del video è obbligatoria'],
      default: 0,
    },
    order: {
      type: Number,
      default: 1,
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    protection: {
      type: String,
      enum: ['standard', 'restricted'],
      default: 'standard',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;