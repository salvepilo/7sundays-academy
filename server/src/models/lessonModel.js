import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pdf', 'link', 'code', 'image', 'document', 'presentation'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  size: {
    type: Number // in bytes
  },
  downloadCount: {
    type: Number,
    default: 0
  }
});

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  explanation: String,
  points: {
    type: Number,
    default: 1
  }
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Il titolo è obbligatorio'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'La sezione è obbligatoria']
  },
  order: {
    type: Number,
    required: [true, 'L\'ordine è obbligatorio']
  },
  isFree: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  resources: [{
    type: {
      type: String,
      enum: ['pdf', 'link', 'code'],
      required: [true, 'Il tipo di risorsa è obbligatorio']
    },
    title: {
      type: String,
      required: [true, 'Il titolo della risorsa è obbligatorio']
    },
    url: {
      type: String,
      required: [true, 'L\'URL della risorsa è obbligatorio']
    }
  }],
  quiz: [quizSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  completionCriteria: {
    type: String,
    enum: ['watch', 'quiz', 'both'],
    default: 'watch'
  },
  minimumScore: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
lessonSchema.index({ course: 1, section: 1, order: 1 });
lessonSchema.index({ status: 1 });
lessonSchema.index({ isFree: 1 });

// Check if the model already exists
const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

export default Lesson; 