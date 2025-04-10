import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Il titolo del test è obbligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Il test deve essere associato a un corso'],
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['multiple-choice', 'true-false', 'open-ended'],
          default: 'multiple-choice',
        },
        options: [String], // Per domande a scelta multipla
        correctAnswer: String, // Per domande a scelta multipla e vero/falso
        points: {
          type: Number,
          default: 1,
        },
        aiEvaluation: {
          type: Boolean,
          default: false, // Se true, la risposta sarà valutata da OpenAI
        },
        aiEvaluationCriteria: {
          type: String, // Criteri per la valutazione AI delle domande aperte
          default: '',
        },
      },
    ],
    timeLimit: {
      type: Number, // Tempo limite in minuti
      default: 30,
    },
    passingScore: {
      type: Number, // Punteggio minimo per superare il test (percentuale)
      default: 70,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    allowRetake: {
      type: Boolean,
      default: true,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    // Statistiche del test
    stats: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      passRate: {
        type: Number, // Percentuale di studenti che hanno superato il test
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual per calcolare il punteggio totale possibile
testSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual per calcolare il numero di domande
testSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Metodo per aggiornare le statistiche del test
testSchema.methods.updateStats = async function(newScore, passed) {
  // Incrementa il numero totale di tentativi
  this.stats.totalAttempts += 1;
  
  // Aggiorna il punteggio medio
  const oldTotalScore = this.stats.averageScore * (this.stats.totalAttempts - 1);
  const newTotalScore = oldTotalScore + newScore;
  this.stats.averageScore = newTotalScore / this.stats.totalAttempts;
  
  // Aggiorna il tasso di superamento
  const oldPassCount = Math.round(this.stats.passRate * (this.stats.totalAttempts - 1) / 100);
  const newPassCount = oldPassCount + (passed ? 1 : 0);
  this.stats.passRate = (newPassCount / this.stats.totalAttempts) * 100;
  
  await this.save();
};

const Test = mongoose.model('Test', testSchema);

export default Test;