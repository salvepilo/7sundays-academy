import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'utente è obbligatorio"],
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'La domanda è obbligatoria'],
    },
    selectedOptions: {
      type: [Number],
      default: [],
    },
    textAnswer: {
      type: String,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indici per migliorare le performance delle query
answerSchema.index({ question: 1, user: 1 }, { unique: true });

// Middleware pre-save per verificare la correttezza della risposta
answerSchema.pre('save', async function(next) {
  try {
    if (this.isNew || this.isModified('selectedOptions') || this.isModified('textAnswer')) {
      // Recupera la domanda per verificare la risposta
      const Question = mongoose.model('Question');
      const question = await Question.findById(this.question);
      
      if (!question) {
        return next(new Error('Domanda non trovata'));
      }
      
      // Verifica la correttezza in base al tipo di domanda
      if (question.type === 'multipla') {
        // Verifica che tutte le opzioni selezionate siano corrette
        const correctOptions = question.options
          .map((option, index) => option.isCorrect ? index : -1)
          .filter(index => index !== -1);
        
        // Verifica se le opzioni selezionate corrispondono a quelle corrette
        const allCorrect = this.selectedOptions.length === correctOptions.length &&
          this.selectedOptions.every(optionIndex => 
            correctOptions.includes(optionIndex)
          );
        
        this.isCorrect = allCorrect;
        this.score = allCorrect ? question.points : 0;
      } 
      else if (question.type === 'vero-falso' || question.type === 'risposta-aperta') {
        // Per domande a risposta aperta, potrebbe essere necessaria una logica più complessa
        // Qui implementiamo un confronto semplice, ma in produzione potresti voler usare
        // algoritmi più sofisticati per il confronto del testo
        const userAnswer = this.textAnswer ? this.textAnswer.toLowerCase().trim() : '';
        const correctAnswer = question.options.find(opt => opt.isCorrect)?.text.toLowerCase().trim();
        
        this.isCorrect = userAnswer === correctAnswer;
        this.score = this.isCorrect ? question.points : 0;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Answer = mongoose.model('Answer', answerSchema);

export default Answer;
