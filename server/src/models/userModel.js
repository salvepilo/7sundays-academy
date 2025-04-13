import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Il nome è obbligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email è obbligatoria'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'La password è obbligatoria'],
    minlength: [6, 'La password deve essere di almeno 6 caratteri']
  },
  role: {
    type: String,
    enum: ['user', 'instructor', 'admin'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Check if the model already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 