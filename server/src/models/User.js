import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Il nome è obbligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email è obbligatoria"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Fornisci un indirizzo email valido'],
    },
    avatar: {
      type: String,
      default: '/images/avatars/default.jpg',
    },
    password: {
      type: String,
      required: [true, 'La password è obbligatoria'],
      minlength: 8,
      select: false, // Non include la password nelle query
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Conferma la tua password'],
      validate: {
        // Questa validazione funziona solo con CREATE e SAVE
        validator: function(el) {
          return el === this.password;
        },
        message: 'Le password non corrispondono'
      }
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    completedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    enrolledCourses: [{
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      progress: {
        type: Number,
        default: 0,
      },
      lastWatched: {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
        },
        timestamp: Number, // Posizione in secondi nel video
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
    }],
    testScores: {
      type: Map,
      of: Number,
      default: {},
    },
    preferences: {
      notifications: {
        email: {
          courseUpdates: {
            type: Boolean,
            default: true,
          },
          newLessons: {
            type: Boolean,
            default: true,
          },
          promotions: {
            type: Boolean,
            default: false,
          },
          testResults: {
            type: Boolean,
            default: true,
          }
        },
        push: {
          courseUpdates: {
            type: Boolean,
            default: true,
          },
          newLessons: {
            type: Boolean,
            default: true,
          },
          promotions: {
            type: Boolean,
            default: false,
          },
          testResults: {
            type: Boolean,
            default: true,
          }
        }
      },
      privacy: {
        showProgress: {
          type: Boolean,
          default: true,
        },
        showCompletedCourses: {
          type: Boolean,
          default: true,
        },
        profileVisibility: {
          type: String,
          enum: ['public', 'enrolled', 'private'],
          default: 'enrolled',
        }
      },
      interface: {
        language: {
          type: String,
          enum: ['it', 'en', 'es', 'fr', 'de'],
          default: 'it',
        },
        theme: {
          type: String,
          enum: ['light', 'dark', 'system'],
          default: 'system',
        },
        autoplay: {
          type: Boolean,
          default: true,
        }
      }
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware pre salvataggio - Hash della password
userSchema.pre('save', async function (next) {
  // Esegui solo se la password è stata modificata
  if (!this.isModified('password')) return next();

  // Hash della password con costo 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Non salvare passwordConfirm nel database
  this.passwordConfirm = undefined;
  
  // Aggiorna passwordChangedAt
  if (this.isNew) {
    this.passwordChangedAt = undefined;
  } else {
    this.passwordChangedAt = Date.now() - 1000; // -1s per garantire che il token sia creato dopo il cambio password
  }
  
  next();
});

// Middleware pre query - Esclude utenti disattivati
userSchema.pre(/^find/, function(next) {
  // Il this punta alla query attuale
  this.find({ active: { $ne: false } });
  next();
});

// Metodo per verificare la password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Metodo per verificare se l'utente ha cambiato password dopo l'emissione del token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False significa che la password NON è stata cambiata
  return false;
};

// Metodo per generare token di reset password
userSchema.methods.createPasswordResetToken = function() {
  // Genera token casuale
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Cripta il token e salvalo nel database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Imposta la scadenza a 10 minuti
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  // Ritorna token non criptato
  return resetToken;
};

// Metodo per verificare se l'utente ha completato un corso
userSchema.methods.hasCompletedCourse = function (courseId) {
  return this.completedCourses.some(id => id.toString() === courseId.toString());
};

// Metodo per verificare se l'utente ha superato un test
userSchema.methods.hasPassedTest = function (testId, minScore = 70) {
  const score = this.testScores.get(testId.toString());
  return score && score >= minScore;
};

// Metodo per calcolare il progresso medio su tutti i corsi
userSchema.methods.getAverageProgress = function () {
  if (this.enrolledCourses.length === 0) return 0;
  
  const totalProgress = this.enrolledCourses.reduce(
    (sum, course) => sum + course.progress,
    0
  );
  
  return totalProgress / this.enrolledCourses.length;
};

const User = mongoose.model('User', userSchema);

export default User;