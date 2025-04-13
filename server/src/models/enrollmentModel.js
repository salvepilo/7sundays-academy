import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utente è obbligatorio']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Il corso è obbligatorio']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  payment: {
    amount: {
      type: Number,
      required: function() {
        return this.course?.price > 0;
      }
    },
    currency: {
      type: String,
      default: 'usd'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentIntentId: String
  }
}, {
  timestamps: true
});

// Ensure one student can only enroll in a course once
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Check if the model already exists
const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment; 