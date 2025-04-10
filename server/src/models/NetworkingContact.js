import mongoose from 'mongoose';
import validator from 'validator';

import * as User from './User.js';

const networkingContactSchema = new mongoose.Schema(
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
    },
    phone: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'La posizione lavorativa è obbligatoria'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "L'azienda è obbligatoria"],
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'La biografia è obbligatoria'],
      trim: true,
    },
    photo: {
      type: String,
      default: '/images/contacts/default.jpg',
    },
    category: {
      type: String,
      required: [true, 'La categoria è obbligatoria'],
      enum: ['marketing', 'sviluppo', 'design', 'management', 'risorse-umane', 'finanza', 'legale', 'altro'],
    },
    skills: [String],
    location: {
      type: String,
      trim: true,
    },
    availability: {
      type: String,
      enum: ['disponibile', 'limitata', 'non-disponibile'],
      default: 'disponibile',
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'telefono', 'linkedin', 'piattaforma'],
      default: 'email',
    },
    requirements: {
      requiredCourses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
      ],
      requiredTests: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Test',
        },
      ],
      minTestScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
    },
    stats: {
      viewCount: {
        type: Number,
        default: 0,
      },
      contactRequests: {
        type: Number,
        default: 0,
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indici per migliorare le performance delle query
networkingContactSchema.index({ category: 1, skills: 1, isActive: 1 });
networkingContactSchema.index({ company: 1 });

// Metodo per incrementare il contatore delle visualizzazioni
networkingContactSchema.methods.incrementViewCount = async function() {
  this.stats.viewCount += 1;
  return this.save();
};

// Metodo per incrementare il contatore delle richieste di contatto
networkingContactSchema.methods.incrementContactCount = async function() {
  this.stats.contactRequests += 1;
  this.stats.lastActive = Date.now();
  return this.save();
};

// Metodo per verificare se un utente può accedere a questo contatto
networkingContactSchema.methods.canUserAccess = async function(userId) {
  try {
    // Se il contatto non ha requisiti, tutti possono accedervi
    if (
      !this.requirements.requiredCourses.length &&
      !this.requirements.requiredTests.length &&
      this.requirements.minTestScore === 0
    ) {
      return true;
    }

    // Ottieni l'utente con i corsi completati e i punteggi dei test
    const user = await User.findById(userId).select('completedCourses testScores role');
    
    // Gli amministratori possono sempre accedere
    if (user.role === 'admin') return true;
    
    // Verifica i corsi completati
    const hasCompletedRequiredCourses = this.requirements.requiredCourses.length === 0 || 
      this.requirements.requiredCourses.every(courseId => 
        user.completedCourses.some(id => id.toString() === courseId.toString())
      );
    
    if (!hasCompletedRequiredCourses) return false;
    
    // Verifica i test richiesti
    for (const testId of this.requirements.requiredTests) {
      const score = user.testScores.get(testId.toString());
      
      // Se il test non è stato completato o il punteggio è inferiore al minimo richiesto
      if (!score || score < this.requirements.minTestScore) {
        return false;
      }
    }
    
    // Se tutte le verifiche sono state superate, l'utente può accedere
    return true;
  } catch (error) {
    console.error('Errore nella verifica dell\'accesso:', error);
    return false;
  }
};

// Middleware per le query per escludere i contatti non attivi
networkingContactSchema.pre(/^find/, function(next) {
  // Escludi i contatti non attivi a meno che non sia esplicitamente richiesto
  if (!this._conditions.isActive) {
    this.find({ isActive: { $ne: false } });
  }
  next();
});

const NetworkingContact = mongoose.model('NetworkingContact', networkingContactSchema);

export default NetworkingContact;