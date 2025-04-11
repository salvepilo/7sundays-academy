import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Il titolo della lezione è obbligatorio'],
      trim: true,
      maxlength: [100, 'Il titolo non può superare i 100 caratteri'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Il sottotitolo non può superare i 200 caratteri'],
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
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    },
    content: {
      type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'assignment'],
        required: [true, 'Il tipo di contenuto è obbligatorio'],
      },
      videoUrl: {
        type: String,
        required: function() { return this.content.type === 'video'; },
      },
      textContent: {
        type: String,
        required: function() { return this.content.type === 'text'; },
      },
      assignment: {
        instructions: {
          type: String,
          required: function() { return this.content.type === 'assignment'; },
        },
        dueDate: Date,
        maxScore: {
          type: Number,
          default: 100,
        },
      },
    },
    duration: {
      type: Number,
      required: [true, 'La durata della lezione è obbligatoria'],
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
        description: String,
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['pdf', 'video', 'link', 'altro'],
          default: 'altro',
        },
        isRequired: {
          type: Boolean,
          default: false,
        },
      },
    ],
    objectives: [{
      title: {
        type: String,
        required: true,
      },
      description: String,
    }],
    prerequisites: [{
      title: {
        type: String,
        required: true,
      },
      description: String,
    }],
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
    completionCriteria: {
      type: String,
      enum: ['watch', 'quiz', 'assignment'],
      default: 'watch',
    },
    minimumScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 70,
      required: function() {
        return this.completionCriteria === 'quiz' || this.completionCriteria === 'assignment';
      },
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