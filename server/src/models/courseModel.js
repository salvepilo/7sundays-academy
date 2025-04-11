import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Il titolo è obbligatorio'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descrizione è obbligatoria']
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Il prezzo è obbligatorio'],
    min: [0, 'Il prezzo non può essere negativo']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'La categoria è obbligatoria']
  },
  subcategories: [{
    type: String
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Il livello è obbligatorio']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  requirements: [{
    type: String
  }],
  objectives: [{
    type: String
  }],
  targetAudience: [{
    type: String
  }],
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  totalSections: {
    type: Number,
    default: 0
  },
  previewLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalEnrollments: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageCompletionTime: {
    type: Number, // in days
    default: 0
  },
  tags: [{
    type: String
  }],
  language: {
    type: String,
    default: 'italiano'
  },
  certificate: {
    type: Boolean,
    default: false
  },
  certificateTemplate: {
    type: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    startDate: Date,
    endDate: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ title: 'text', description: 'text', shortDescription: 'text' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ totalEnrollments: -1 });

// Virtual for total sections and lessons
courseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'course'
});

courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course'
});

const Course = mongoose.model('Course', courseSchema);

export default Course; 