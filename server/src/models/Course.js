import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Il titolo del corso è obbligatorio'],
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
      required: [true, 'La descrizione del corso è obbligatoria'],
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      required: [true, 'La durata del corso è obbligatoria'],
    },
    level: {
      type: String,
      enum: ['principiante', 'intermedio', 'avanzato'],
      default: 'principiante',
    },
    category: {
      type: String,
      required: [true, 'La categoria del corso è obbligatoria'],
    },
    modules: [{
      title: {
        type: String,
        required: [true, 'Il titolo del modulo è obbligatorio'],
      },
      description: {
        type: String,
      },
      order: {
        type: Number,
        default: 0,
      },
      lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      }],
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'istruttore del corso è obbligatorio"],
    },
    lessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    }],
    enrolledCount: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'La valutazione minima è 0'],
      max: [5, 'La valutazione massima è 5'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    requirements: [{
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      }
    }],
    objectives: [{
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      }
    }],
    price: {
      type: Number,
      required: [true, 'Il prezzo del corso è obbligatorio'],
      min: [0, 'Il prezzo non può essere negativo'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Il prezzo scontato non può essere negativo'],
      validate: {
        validator: function(value) {
          return !value || value <= this.price;
        },
        message: 'Il prezzo scontato deve essere minore o uguale al prezzo originale'
      }
    },
    supportMaterials: [{
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      url: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['pdf', 'video', 'link', 'altro'],
        default: 'altro',
      }
    }],
    stripeProductId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePriceId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual per calcolare il numero di lezioni
courseSchema.virtual('lessonsCount').get(function() {
  return this.lessons ? this.lessons.length : 0;
});

// Middleware per popolare automaticamente le lezioni quando si ottiene un corso
courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'name',
  });
  next();
});

// Metodo statico per calcolare le statistiche del corso
courseSchema.statics.calculateStats = async function(courseId) {
  const User = mongoose.model('User');
  
  // Calcola il numero di iscritti
  const enrolledCount = await User.countDocuments({
    'enrolledCourses.courseId': courseId,
  });
  
  // Calcola il tasso di completamento
  const completedCount = await User.countDocuments({
    completedCourses: courseId,
  });
  
  const completionRate = enrolledCount > 0 ? (completedCount / enrolledCount) * 100 : 0;
  
  // Aggiorna il corso con le nuove statistiche
  await this.findByIdAndUpdate(courseId, {
    enrolledCount,
    completionRate,
  });
};

const Course = mongoose.model('Course', courseSchema);

export default Course;