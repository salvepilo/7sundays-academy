import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Il titolo è obbligatorio'],
    trim: true
  },
  description: {
    type: String
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  lessonsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  completionCriteria: {
    type: String,
    enum: ['all', 'any', 'percentage'],
    default: 'all'
  },
  requiredPercentage: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for better query performance
sectionSchema.index({ course: 1, order: 1 });
sectionSchema.index({ status: 1 });

const Section = mongoose.model('Section', sectionSchema);

export default Section; 