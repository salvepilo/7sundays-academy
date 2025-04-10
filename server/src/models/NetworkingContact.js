const mongoose = require('mongoose');

const networkingContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Il nome del contatto è obbligatorio'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'La posizione professionale è obbligatoria'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "L'azienda è obbligatoria"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email è obbligatoria"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} non è un indirizzo email valido!`
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'La categoria è obbligatoria'],
      enum: ['marketing', 'design', 'development', 'business', 'other'],
    },
    skills: [String],
    // Requisiti per accedere al contatto
    requirements: {
      minTestScore: {
        type: Number,
        default: 80, // Punteggio minimo richiesto (percentuale)
      },
      requiredTests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
      }],
      requiredCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Statistiche
    stats: {
      viewCount: {
        type: Number,
        default: 0,
      },
      contactCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Metodo per verificare se un utente può accedere a questo contatto
networkingContactSchema.methods.canUserAccess = async function(userId) {
  const User = mongoose.model('User');
  const TestAttempt = mongoose.model('TestAttempt');
  
  // Ottieni l'utente con i corsi completati
  const user = await User.findById(userId).select('completedCourses testScores');
  if (!user) return false;
  
  // Verifica i corsi richiesti
  const hasRequiredCourses = this.requirements.requiredCourses.length === 0 || 
    this.requirements.requiredCourses.every(courseId => 
      user.completedCourses.some(id => id.toString() === courseId.toString())
    );
  
  if (!hasRequiredCourses) return false;
  
  // Verifica i test richiesti
  if (this.requirements.requiredTests.length > 0) {
    for (const testId of this.requirements.requiredTests) {
      const bestScore = await TestAttempt.getBestScore(userId, testId);
      if (bestScore < this.requirements.minTestScore) {
        return false;
      }
    }
  }
  
  return true;
};

// Incrementa il contatore delle visualizzazioni
networkingContactSchema.methods.incrementViewCount = async function() {
  this.stats.viewCount += 1;
  await this.save();
};

// Incrementa il contatore dei contatti
networkingContactSchema.methods.incrementContactCount = async function() {
  this.stats.contactCount += 1;
  await this.save();
};

const NetworkingContact = mongoose.model('NetworkingContact', networkingContactSchema);

module.exports = NetworkingContact;