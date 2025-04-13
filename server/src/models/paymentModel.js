import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'L\'importo è obbligatorio']
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Il metodo di pagamento è obbligatorio']
  },
  transactionId: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Check if the model already exists
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment; 