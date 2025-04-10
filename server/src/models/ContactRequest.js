import mongoose from 'mongoose';

const contactRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il mittente è obbligatorio'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NetworkingContact',
      required: [true, 'Il destinatario è obbligatorio'],
    },
    message: {
      type: String,
      required: [true, 'Il messaggio della richiesta è obbligatorio'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indici per ottimizzare le query frequenti
contactRequestSchema.index({ sender: 1, status: 1 });
contactRequestSchema.index({ recipient: 1, status: 1 });
contactRequestSchema.index({ createdAt: -1 });

// Metodo statico per contare le richieste pendenti per un utente
contactRequestSchema.statics.countPendingRequests = async function(userId) {
  return await this.countDocuments({ 
    recipient: userId,
    status: 'pending'
  });
};

// Metodo statico per contare le richieste inviate da un utente
contactRequestSchema.statics.countSentRequests = async function(userId) {
  return await this.countDocuments({ 
    sender: userId
  });
};

// Metodo statico per verificare se esiste già una richiesta pendente
contactRequestSchema.statics.existsPendingRequest = async function(senderId, recipientId) {
  return await this.exists({
    sender: senderId,
    recipient: recipientId,
    status: 'pending'
  });
};

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

export default ContactRequest;