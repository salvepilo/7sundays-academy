const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utente è obbligatorio"],
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: [true, 'Il test è obbligatorio'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    answers: [
      {
        questionIndex: Number,
        answer: String,
        isCorrect: Boolean,
        aiEvaluation: {
          score: Number, // Punteggio da 0 a 1 per risposte valutate da AI
          feedback: String,
        },
        points: Number,
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentageScore: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    timeSpent: {
      type: Number, // Tempo impiegato in secondi
      required: true,
    },
    attempt: {
      type: Number, // Numero del tentativo (1, 2, 3, ecc.)
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indice per trovare rapidamente tutti i tentativi di un utente
testAttemptSchema.index({ user: 1, test: 1 });

// Metodo per verificare se l'utente ha superato il test
testAttemptSchema.statics.hasUserPassedTest = async function(userId, testId) {
  const attempt = await this.findOne(
    { user: userId, test: testId, passed: true },
    { passed: 1 }
  ).sort({ completedAt: -1 });
  
  return !!attempt;
};

// Metodo per ottenere il miglior punteggio di un utente per un test
testAttemptSchema.statics.getBestScore = async function(userId, testId) {
  const bestAttempt = await this.findOne(
    { user: userId, test: testId },
    { percentageScore: 1 }
  ).sort({ percentageScore: -1 });
  
  return bestAttempt ? bestAttempt.percentageScore : 0;
};

// Metodo per contare il numero di tentativi di un utente per un test
testAttemptSchema.statics.countUserAttempts = async function(userId, testId) {
  return await this.countDocuments({ user: userId, test: testId });
};

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

module.exports = TestAttempt;